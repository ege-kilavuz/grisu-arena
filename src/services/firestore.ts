import firestore from '@react-native-firebase/firestore';
import { MCQQuestion, FillQuestion, MatchQuestion } from '../question/QuestionEngine';

export type QuestionDoc = MCQQuestion | FillQuestion | MatchQuestion;

const qCol = firestore().collection('questions');

export async function getQuestions(): Promise<QuestionDoc[]> {
  const snap = await qCol.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionDoc));
}

export async function addQuestion(q: QuestionDoc) {
  await qCol.add(q);
}

export async function updateQuestion(id: string, data: Partial<QuestionDoc>) {
  await qCol.doc(id).update(data);
}

export async function deleteQuestion(id: string) {
  await qCol.doc(id).delete();
}
