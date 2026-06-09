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

export interface DiagnosticLog {
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

/**
 * Runs a complete diagnostic check on a specified Spreadsheet ID to detect 404 or writing/permission errors.
 */
export async function diagnoseSpreadsheetAccess(
  accessToken: string,
  spreadsheetId: string
): Promise<{ logs: DiagnosticLog[]; success: boolean }> {
  const logs: DiagnosticLog[] = [];
  const log = (type: 'info' | 'success' | 'error', message: string) => {
    logs.push({ timestamp: new Date().toLocaleTimeString('ar-EG'), type, message });
  };

  log('info', `بدء فحص وتتبع الاتصال بالجدول ذي المعرّف: ${spreadsheetId}`);

  if (!accessToken) {
    log('error', 'خطأ: لا يوجد رمز مصادقة Google (Access Token). يرجى ربط الحساب أولاً.');
    return { logs, success: false };
  }

  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  log('info', `جاري قراءة بيانات الجدول الوصفية (Metadata) من مسار API...`);

  try {
    const metaRes = await fetch(metaUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    log('info', `حالة استجابة الخادم لطلب البيانات الوصفية: [${metaRes.status} ${metaRes.statusText}]`);

    if (metaRes.status === 404) {
      log('error', `🚫 خطأ (404 Not Found): جدول البيانات ذو المعرّف "${spreadsheetId}" غير موجود أو تم حذفه بشكل نهائي. يرجى مراجعة المعرّف المدخل.`);
      return { logs, success: false };
    } else if (metaRes.status === 403) {
      log('error', `🚫 خطأ (403 Forbidden / Permission Error): لا تمتلك صلاحية الوصول إلى هذا جدول البيانات أو لم تمنح التطبيق صلاحية الوصول لجوجل درايف (OAuth Scopes).`);
      return { logs, success: false };
    } else if (metaRes.status === 401) {
      log('error', `🚫 خطأ (401 Unauthorized): انتهت صلاحية المصادقة الخاصة بك، يرجى إعادة تسجيل الدخول.`);
      return { logs, success: false };
    } else if (!metaRes.ok) {
      const errorText = await metaRes.text();
      log('error', `🚫 فشل الاتصال برمز خطأ (${metaRes.status}): ${errorText}`);
      return { logs, success: false };
    }

    const metaData = await metaRes.json();
    log('success', `✅ تم التحقق من وجود الملف بنجاح! عنوان الجدول: "${metaData.properties.title || 'بدون عنوان'}"`);

    // Let's test reading values
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:B5`;
    log('info', `جاري اختبار قراءة قيم الخلايا من Sheet1!A1...`);

    const readRes = await fetch(readUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!readRes.ok) {
      const errorText = await readRes.text();
      log('error', `⚠️ تنبيه: فشل اختبار قراءة الخلايا (${readRes.status}). قد لا تكون الورقة باسم Sheet1 متواجدة بعد أو فارغة: ${errorText}`);
    } else {
      log('success', `✅ تم اختبار قراءة قيم الخلايا بنجاح!`);
    }

    // Let's test writing a diagnostics cell (Sheet1!Z100 so we don't mess up data)
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!Z100?valueInputOption=USER_ENTERED`;
    log('info', `جاري اختبار الكتابة في خلية تشخيصية غير مرئية (Sheet1!Z100)...`);

    const writeRes = await fetch(writeUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[`تشخيص تلقائي منظم - Diagnostic Check: OK (${new Date().toISOString()})`]],
      }),
    });

    log('info', `حالة استجابة خادم الكتابة: [${writeRes.status} ${writeRes.statusText}]`);

    if (writeRes.status === 403) {
      log('error', `🚫 خطأ (403 Permission Error): حسابك لا يملك صلاحيات الكتابة أو تعديل هذا الملف (صلاحيات القراءة فقط). يرجى مراجعة إعدادات المشاركة للملف.`);
      return { logs, success: false };
    } else if (writeRes.status === 404) {
      log('error', `🚫 خطأ (404 Write Error): تعذّر التعديل لوجود خلل في استيراد الورقة أو أن الملف غير موجود.`);
      return { logs, success: false };
    } else if (!writeRes.ok) {
      const errorText = await writeRes.text();
      log('error', `🚫 فشل كتابة البيانات بالجدول (${writeRes.status}): ${errorText}`);
      return { logs, success: false };
    }

    log('success', `🎉 تم التحقق بنجاح وتأمين أذونات القراءة والكتابة للجدول! وهو جاهز بالكامل للمزامنة والتخزين.`);
    return { logs, success: true };

  } catch (error: any) {
    log('error', `🚨 خطأ في الاتصال بالشبكة أو معالجة الاستجابة: ${error.message || error}`);
    return { logs, success: false };
  }
}

/**
 * Reads all rows from the Google Sheet and converts them back into Task objects.
 */
export async function fetchTasksFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<Task[] | null> {
  const range = 'Sheet1!A2:K2000'; // Reading up to 2000 tasks
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch values from Google Sheet:', await res.text());
      return null;
    }

    const data = await res.json();
    if (!data.values || data.values.length === 0) {
      return [];
    }

    // Bidirectional Arabic/English converters
    const deptReverseMap: Record<string, 'housekeeping' | 'maintenance' | 'food_service'> = {
      'قسم النظافة': 'housekeeping',
      'قسم الصيانة': 'maintenance',
      'خدمة الغرف / الطعام': 'food_service',
      'housekeeping': 'housekeeping',
      'maintenance': 'maintenance',
      'food_service': 'food_service',
    };

    const statusReverseMap: Record<string, 'pending' | 'in_progress' | 'completed'> = {
      'بالانتظار 🕒': 'pending',
      'قيد التنفيذ 🛠️': 'in_progress',
      'مكتملة بنجاح ✅': 'completed',
      'pending': 'pending',
      'in_progress': 'in_progress',
      'completed': 'completed',
    };

    const priorityReverseMap: Record<string, 'low' | 'medium' | 'high'> = {
      'منخفضة': 'low',
      'متوسطة': 'medium',
      'قصوى / عاجلة': 'high',
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
    };

    const parsedTasks: Task[] = data.values
      .filter((row: any[]) => row && row.length > 0 && row[0]) // must have ID
      .map((row: any[]): Task => {
        const id = String(row[0]).trim();
        const title = row[1] ? String(row[1]).trim() : 'مهمة بدون عنوان';
        const roomNumber = row[2] ? String(row[2]).trim() : '';
        
        const rawDept = row[3] ? String(row[3]).trim() : 'housekeeping';
        const department = deptReverseMap[rawDept] || 'housekeeping';
        
        const description = row[4] ? String(row[4]).trim() : '';
        
        const rawStatus = row[5] ? String(row[5]).trim() : 'pending';
        const status = statusReverseMap[rawStatus] || 'pending';
        
        const rawPriority = row[6] ? String(row[6]).trim() : 'medium';
        const priority = priorityReverseMap[rawPriority] || 'medium';
        
        const assignedTo = row[7] === 'لم يتم التعيين' || !row[7] ? undefined : String(row[7]).trim();
        
        // Date parser
        let createdAt = new Date().toISOString();
        if (row[8]) {
          try {
            const rawDateStr = String(row[8]).trim();
            // Convert ar-EG localized numbers if any, and replace odd characters
            const normalizedDateStr = rawDateStr
              .replace(/[٠-٩]/g, (d: string) => String.fromCharCode(d.charCodeAt(0) - 1632))
              .replace(/،/g, ',');
            const attempt = Date.parse(normalizedDateStr);
            if (!isNaN(attempt)) {
              createdAt = new Date(attempt).toISOString();
            } else {
              createdAt = rawDateStr;
            }
          } catch {
            createdAt = row[8];
          }
        }

        const createdBy = row[10] ? String(row[10]).trim() : 'نظام ريجنسي';

        return {
          id,
          title,
          roomNumber,
          department,
          description,
          status,
          priority,
          assignedTo,
          createdAt,
          updatedAt: new Date().toISOString(),
          synced: true,
          createdBy,
        };
      });

    return parsedTasks.filter(t => t.id && t.id !== 'معرّف المهمة (Task ID)');
  } catch (error) {
    console.error('Error fetching tasks from sheet:', error);
    return null;
  }
}
