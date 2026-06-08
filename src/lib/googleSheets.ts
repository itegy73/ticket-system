/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task } from '../types';

/**
 * Searches for an existing spreadsheet named "نظام الجراند الفندقي - Regency Hotel Tasks" in user's Google Drive.
 */
export async function findSpreadsheet(accessToken: string): Promise<{ id: string; url: string } | null> {
  const query = encodeURIComponent("name = 'نظام الجراند الفندقي - Regency Hotel Tasks' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Failed to search spreadsheet:', err);
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return {
        id: data.files[0].id,
        url: data.files[0].webViewLink,
      };
    }
  } catch (error) {
    console.error('Error finding spreadsheet:', error);
  }

  return null;
}

/**
 * Creates a new spreadsheet in the user's Google Drive with default headers.
 */
export async function createSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  try {
    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: 'نظام الجراند الفندقي - Regency Hotel Tasks',
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create spreadsheet: ${await res.text()}`);
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;
    const webViewLink = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // Initialize the headers
    await updateSheetValues(accessToken, spreadsheetId, [
      [
        'معرّف المهمة (Task ID)',
        'العنوان (Title)',
        'رقم الغرفة (Room Number)',
        'القسم (Department)',
        'الوصف (Description)',
        'الحالة (Status)',
        'الأولوية (Priority)',
        'الموظف المسؤول (Assigned To)',
        'تاريخ الإنشاء (Created At)',
        'الحالة بالمزامنة (Sync)',
        'المسجل (Created By)'
      ]
    ]);

    return {
      id: spreadsheetId,
      url: webViewLink,
    };
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
}

/**
 * Updates cells inside the Google Sheet using the Values resource.
 */
export async function updateSheetValues(
  accessToken: string,
  spreadsheetId: string,
  rows: any[][]
): Promise<boolean> {
  const range = 'Sheet1!A1';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    });

    if (!res.ok) {
      console.error('Failed to update values:', await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating values:', error);
    return false;
  }
}

/**
 * Re-syncs all live tasks with the Google Sheet.
 */
export async function syncAllTasksToSheet(
  accessToken: string,
  spreadsheetId: string,
  tasks: Task[]
): Promise<boolean> {
  // Map departments to Arabic
  const deptMap: Record<string, string> = {
    housekeeping: 'قسم النظافة',
    maintenance: 'قسم الصيانة',
    food_service: 'خدمة الغرف / الطعام',
  };

  // Map statuses to Arabic
  const statusMap: Record<string, string> = {
    pending: 'بالانتظار 🕒',
    in_progress: 'قيد التنفيذ 🛠️',
    completed: 'مكتملة بنجاح ✅',
  };

  // Map priorities to Arabic
  const priorityMap: Record<string, string> = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'قصوى / عاجلة',
  };

  const rows = [
    [
      'معرّف المهمة (Task ID)',
      'العنوان (Title)',
      'رقم الغرفة (Room Number)',
      'القسم (Department)',
      'الوصف (Description)',
      'الحالة (Status)',
      'الأولوية (Priority)',
      'الموظف المسؤول (Assigned To)',
      'تاريخ الإنشاء (Created At)',
      'الحالة بالمزامنة (Sync)',
      'المسجل (Created By)'
    ],
    ...tasks.map((t) => [
      t.id,
      t.title,
      t.roomNumber,
      deptMap[t.department] || t.department,
      t.description,
      statusMap[t.status] || t.status,
      priorityMap[t.priority] || t.priority,
      t.assignedTo || 'لم يتم التعيين',
      new Date(t.createdAt).toLocaleString('ar-EG'),
      'تمت المزامنة بنجاح ✅',
      t.createdBy,
    ]),
  ];

  return updateSheetValues(accessToken, spreadsheetId, rows);
}
