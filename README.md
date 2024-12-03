# לוח שנה מתקדם

מערכת לוח שנה מתקדמת עם ניהול אירועים ומערכת הרשאות.

## תכונות

- תצוגת לוח שנה חודשית ושנתית
- ניהול אירועים (הוספה, עריכה, מחיקה)
- מערכת הרשאות (מנהל ומשתמש)
- ממשק משתמש מותאם למובייל
- תמיכה מלאה בעברית
- אפשרות להוספת אירועים ליומן האישי

## התקנה

### דרישות מקדימות

- Node.js
- MongoDB
- npm או yarn

### שלבי התקנה

1. התקנת חבילות בצד הלקוח:
```bash
cd client
npm install
```

2. התקנת חבילות בצד השרת:
```bash
cd server
npm install
```

3. הגדרת משתני סביבה:
צור קובץ `.env` בתיקיית השרת עם התוכן הבא:
```
MONGODB_URI=mongodb://localhost:27017/calendar
JWT_SECRET=your-secret-key
PORT=5000
```

4. הפעלת השרת:
```bash
cd server
npm run dev
```

5. הפעלת הלקוח:
```bash
cd client
npm start
```

## פרטי התחברות מנהל ראשי

- שם משתמש: משה
- סיסמה: 123

## טכנולוגיות

- React
- TypeScript
- Material-UI
- FullCalendar
- Node.js
- Express
- MongoDB
- JWT 