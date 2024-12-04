import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    or,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../firebase/config';

const EVENTS_COLLECTION = 'events';

// הגדרת הממשק Event עם ייצוא
export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    createdBy: string;
    participants: string[];
    isPublic: boolean;
    category: string;
    createdAt: Date;
    updatedAt: Date;
    isGlobalAdminEvent?: boolean;
}

interface FirestoreEvent extends Omit<Event, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> {
    startDate: Timestamp;
    endDate: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isGlobalAdminEvent?: boolean;
}

const convertToFirestoreEvent = (event: Partial<Event>): Partial<FirestoreEvent> => {
    const firestoreEvent: Partial<FirestoreEvent> = {};
    
    // העתק שדות שאינם תאריכים
    if (event.title) firestoreEvent.title = event.title;
    if (event.description) firestoreEvent.description = event.description;
    if (event.location) firestoreEvent.location = event.location;
    if (event.createdBy) firestoreEvent.createdBy = event.createdBy;
    if (event.participants) firestoreEvent.participants = event.participants;
    if (event.isPublic !== undefined) firestoreEvent.isPublic = event.isPublic;
    if (event.category) firestoreEvent.category = event.category;
    if (event.isGlobalAdminEvent !== undefined) firestoreEvent.isGlobalAdminEvent = event.isGlobalAdminEvent;
    
    // המר תאריכים ל-Timestamp
    if (event.startDate) firestoreEvent.startDate = Timestamp.fromDate(event.startDate);
    if (event.endDate) firestoreEvent.endDate = Timestamp.fromDate(event.endDate);
    if (event.createdAt) firestoreEvent.createdAt = Timestamp.fromDate(event.createdAt);
    if (event.updatedAt) firestoreEvent.updatedAt = Timestamp.fromDate(event.updatedAt);
    
    return firestoreEvent;
};

const convertFromFirestoreEvent = (doc: any): Event => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title,
        description: data.description,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        location: data.location || '',
        createdBy: data.createdBy,
        participants: data.participants || [],
        isPublic: data.isPublic,
        isGlobalAdminEvent: data.isGlobalAdminEvent || false,
        category: data.category || 'כללי',
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
    };
};

export const eventService = {
    async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const now = Timestamp.now();
            
            const firestoreEvent = {
                ...event,
                startDate: Timestamp.fromDate(new Date(event.startDate)),
                endDate: Timestamp.fromDate(new Date(event.endDate)),
                createdAt: now,
                updatedAt: now
            };

            const docRef = await addDoc(collection(db, EVENTS_COLLECTION), firestoreEvent);
            return {
                id: docRef.id,
                ...event,
                createdAt: now.toDate(),
                updatedAt: now.toDate()
            };
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    async updateEvent(eventId: string, eventData: Partial<Event>) {
        try {
            const eventRef = doc(db, EVENTS_COLLECTION, eventId);
            const firestoreEvent = convertToFirestoreEvent(eventData);
            firestoreEvent.updatedAt = Timestamp.now();

            await updateDoc(eventRef, firestoreEvent);
            return { 
                id: eventId,
                ...eventData,
                updatedAt: firestoreEvent.updatedAt.toDate()
            };
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    async deleteEvent(eventId: string) {
        try {
            await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    async getUserEvents(userId: string): Promise<Event[]> {
        try {
            const q = query(
                collection(db, EVENTS_COLLECTION),
                or(
                    where('createdBy', '==', userId),
                    where('isPublic', '==', true)
                ),
                orderBy('startDate', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => 
                convertFromFirestoreEvent(doc)
            );
        } catch (error) {
            console.error('Error fetching user events:', error);
            throw error;
        }
    },

    async getPublicEvents(): Promise<Event[]> {
        try {
            const q = query(
                collection(db, EVENTS_COLLECTION),
                where('isPublic', '==', true),
                orderBy('startDate', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => 
                convertFromFirestoreEvent(doc)
            );
        } catch (error) {
            console.error('Error fetching public events:', error);
            throw error;
        }
    }
}; 