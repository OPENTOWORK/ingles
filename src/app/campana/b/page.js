import CampaignLanding from '@/components/landing/ab/CampaignLanding';
import { campaignMetadata } from '@/lib/abExperiment';

export const metadata = campaignMetadata('b');

export default function CampanaVarianteB({ searchParams }) {
  const source = searchParams?.ab_source === 'b2-guide' ? 'b2-guide' : 'direct';
  return <CampaignLanding variant="b" source={source} />;
}
