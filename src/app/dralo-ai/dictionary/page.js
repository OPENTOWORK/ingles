import { redirect } from 'next/navigation';
import DraloDictionary from '@/components/dralo-ai/DraloDictionary';
import { DICTIONARY_ENABLED } from '@/config/dictionaryFeature';

export default function DraloDictionaryPage() {
  if (!DICTIONARY_ENABLED) redirect('/dralo-ai');
  return <DraloDictionary />;
}
