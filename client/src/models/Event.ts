export interface Event {
    id?: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    createdBy: string;  // מזהה המשתמש שיצר את האירוע
    participants?: string[];  // רשימת מזהי משתמשים שמשתתפים
    isPublic: boolean;  // האם האירוע ציבורי
    isGlobalAdminEvent?: boolean; // האם זה אירוע מנהל גלובלי
    category?: string;  // קטגוריה של האירוע
    createdAt: Date;
    updatedAt: Date;
}

export default Event; 