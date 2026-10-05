import CampaignLanding from '@/components/landing/ab/CampaignLanding';
import { campaignMetadata } from '@/lib/abExperiment';

export const metadata = campaignMetadata('a');

export default function CampanaVarianteA({ searchParams }) {
  const source = searchParams?.ab_source === 'b2-guide' ? 'b2-guide' : 'direct';
  return <CampaignLanding variant="a" source={source} />;
}
