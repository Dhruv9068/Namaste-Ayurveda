import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import mockDiscussions from '../data/mockDiscussions.json';

export interface Discussion {
  id?: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  category: 'mapping' | 'research' | 'general' | 'technical';
  tags: string[];
  createdAt: Timestamp;
  replies: Reply[];
  likes: number;
  views: number;
}

export interface Reply {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: Timestamp;
  likes: number;
}

export class DiscussionService {
  private discussionsCollection = collection(db, 'discussions');

  async createDiscussion(discussion: Omit<Discussion, 'id' | 'createdAt' | 'replies' | 'likes' | 'views'>) {
    try {
      const docRef = await addDoc(this.discussionsCollection, {
        ...discussion,
        createdAt: serverTimestamp(),
        replies: [],
        likes: 0,
        views: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  }

  subscribeToDiscussions(callback: (discussions: Discussion[]) => void) {
    const q = query(this.discussionsCollection, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const discussions: Discussion[] = [];
      snapshot.forEach((doc) => {
        discussions.push({
          id: doc.id,
          ...doc.data()
        } as Discussion);
      });
      callback(discussions);
    });
  }

  // Mock data for when Firebase is not configured
  getMockDiscussions(): Discussion[] {
    return mockDiscussions.map(discussion => ({
      ...discussion,
      createdAt: { toDate: () => new Date(discussion.createdAt) } as Timestamp,
      replies: discussion.replies.map(reply => ({
        ...reply,
        createdAt: { toDate: () => new Date(reply.createdAt) } as Timestamp
      }))
    }));
  }
}

export const discussionService = new DiscussionService();