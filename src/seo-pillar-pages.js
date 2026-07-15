/**
 * SEO pillar page architecture — planning registry only.
 * Does not create new public URLs; links to existing service pages and planned content slugs.
 */
import { SEO_CLUSTERS } from './seo-content-clusters.js';

export const SEO_PILLAR_PAGES = [
  {
    id: 'hair-transplant-guide',
    clusterKey: 'hair',
    title: 'Saç Ekimi Rehberi',
    status: 'planned',
    linkedServices: ['dhi-hair-transplant', 'sapphire-fue-hair-transplant', 'acell-prp', 'exosome-hair-treatment'],
    topics: ['FUE', 'DHI', 'Sapphire FUE', 'PRP', 'Exosome'],
  },
  {
    id: 'aesthetic-surgery-guide',
    clusterKey: 'plastic',
    title: 'Estetik Cerrahi Rehberi',
    status: 'planned',
    linkedServices: ['rhinoplasty', 'face-lift', 'blepharoplasty', 'breast-augmentation'],
    topics: ['Rhinoplasty', 'Face Lift', 'Blepharoplasty', 'Breast Surgery'],
  },
  {
    id: 'dental-aesthetics-guide',
    clusterKey: 'dental',
    title: 'Dental Rehberi',
    status: 'planned',
    linkedServices: ['hollywood-smile', 'zirconium-crown', 'dental-implant'],
    topics: ['Hollywood Smile', 'Veneer', 'Implant', 'Zirconium'],
  },
  {
    id: 'medical-aesthetics-guide',
    clusterKey: 'medical',
    title: 'Medical Aesthetics Rehberi',
    status: 'planned',
    linkedServices: ['botox', 'lip-filler', 'laser-hair-removal'],
    topics: ['Botox', 'Fillers', 'Skin treatments'],
  },
  {
    id: 'longevity-guide',
    clusterKey: 'longevity',
    title: 'Longevity Rehberi',
    status: 'planned',
    linkedServices: ['iv-therapies', 'glutathione', 'maxx-royal-wellness-bodrum'],
    topics: ['Wellness', 'Preventive medicine'],
  },
];

export function getPillarPageById(id) {
  return SEO_PILLAR_PAGES.find((pillar) => pillar.id === id) || null;
}

export function getPillarPagesForCluster(clusterKey) {
  return SEO_PILLAR_PAGES.filter((pillar) => pillar.clusterKey === clusterKey);
}

export function getPillarCoverageSummary() {
  return SEO_PILLAR_PAGES.map((pillar) => {
    const cluster = SEO_CLUSTERS[pillar.clusterKey];
    return {
      id: pillar.id,
      title: pillar.title,
      status: pillar.status,
      clusterKey: pillar.clusterKey,
      clusterLabel: cluster?.label || pillar.clusterKey,
      linkedServiceCount: pillar.linkedServices.length,
      clusterTopicCount: cluster?.clusters?.length || 0,
      pillarStatus: cluster?.pillar?.status || pillar.status,
    };
  });
}

export function listPlannedPillarGaps() {
  return SEO_PILLAR_PAGES.filter((pillar) => pillar.status === 'planned').map((pillar) => ({
    id: pillar.id,
    title: pillar.title,
    clusterKey: pillar.clusterKey,
    missingContent: true,
    recommendedAction: 'Author pillar content and connect internal links from cluster services.',
  }));
}
