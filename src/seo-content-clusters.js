/**
 * SEO content cluster architecture — pillar pages + cluster topics.
 * Content slugs are planning identifiers; pages are not published until content is authored.
 */
export const SEO_CLUSTERS = {
  hair: {
    id: 'hair',
    label: 'Saç Ekimi',
    pillar: {
      slug: 'hair-transplant-guide',
      title: 'Saç Ekimi Rehberi',
      status: 'planned',
      targetServiceSlugs: [
        'dhi-hair-transplant',
        'sapphire-fue-hair-transplant',
        'stem-cell-hair-transplant',
      ],
    },
    clusters: [
      { slug: 'what-is-fue', title: 'FUE nedir?', priority: 'P1', targetServiceSlugs: ['sapphire-fue-hair-transplant'] },
      { slug: 'what-is-dhi', title: 'DHI nedir?', priority: 'P1', targetServiceSlugs: ['dhi-hair-transplant'] },
      { slug: 'fue-vs-dhi', title: 'FUE ve DHI farkları', priority: 'P1', targetServiceSlugs: ['sapphire-fue-hair-transplant', 'dhi-hair-transplant'] },
      { slug: 'hair-transplant-recovery', title: 'Saç ekimi sonrası iyileşme', priority: 'P1', targetServiceSlugs: ['dhi-hair-transplant', 'sapphire-fue-hair-transplant'] },
      { slug: 'hair-transplant-candidates', title: 'Kimler saç ekimi yaptırabilir?', priority: 'P1', targetServiceSlugs: ['dhi-hair-transplant'] },
      { slug: 'hair-transplant-risks', title: 'Saç ekimi riskleri', priority: 'P2', targetServiceSlugs: ['dhi-hair-transplant'] },
      { slug: 'hair-transplant-preparation', title: 'Saç ekimi öncesi hazırlık', priority: 'P2', targetServiceSlugs: ['dhi-hair-transplant'] },
    ],
  },
  plastic: {
    id: 'plastic',
    label: 'Estetik Cerrahi',
    pillar: {
      slug: 'aesthetic-surgery-guide',
      title: 'Estetik Cerrahi Rehberi',
      status: 'planned',
      targetServiceSlugs: ['rhinoplasty', 'breast-augmentation', 'liposuction'],
    },
    clusters: [
      { slug: 'rhinoplasty-guide', title: 'Rinoplasti rehberi', priority: 'P1', targetServiceSlugs: ['rhinoplasty'] },
      { slug: 'breast-aesthetics-guide', title: 'Meme estetiği', priority: 'P1', targetServiceSlugs: ['breast-augmentation', 'breast-reduction'] },
      { slug: 'liposuction-guide', title: 'Liposuction', priority: 'P1', targetServiceSlugs: ['liposuction'] },
      { slug: 'facelift-guide', title: 'Yüz germe', priority: 'P2', targetServiceSlugs: ['face-lift'] },
    ],
  },
  dental: {
    id: 'dental',
    label: 'Diş Estetiği',
    pillar: {
      slug: 'dental-aesthetics-guide',
      title: 'Diş Estetiği Rehberi',
      status: 'planned',
      targetServiceSlugs: ['dental-implant', 'hollywood-smile', 'zirconium-crown'],
    },
    clusters: [
      { slug: 'dental-implant-guide', title: 'İmplant', priority: 'P1', targetServiceSlugs: ['dental-implant'] },
      { slug: 'zirconium-guide', title: 'Zirkonyum', priority: 'P1', targetServiceSlugs: ['zirconium-crown'] },
      { slug: 'hollywood-smile-guide', title: 'Hollywood Smile', priority: 'P1', targetServiceSlugs: ['hollywood-smile'] },
    ],
  },
  medical: {
    id: 'medical',
    label: 'Medikal Estetik',
    pillar: {
      slug: 'medical-aesthetics-guide',
      title: 'Medikal Estetik Rehberi',
      status: 'planned',
      targetServiceSlugs: ['botox', 'lip-filler', 'medical-skin-care'],
    },
    clusters: [
      { slug: 'botox-guide', title: 'Botoks', priority: 'P1', targetServiceSlugs: ['botox'] },
      { slug: 'dermal-fillers-guide', title: 'Dolgu', priority: 'P1', targetServiceSlugs: ['lip-filler', 'jawline-filler'] },
      { slug: 'skin-renewal-guide', title: 'Cilt yenileme', priority: 'P2', targetServiceSlugs: ['medical-skin-care', 'salmon-dna', 'prp-skin-treatment'] },
    ],
  },
  longevity: {
    id: 'longevity',
    label: 'Longevity',
    pillar: {
      slug: 'longevity-guide',
      title: 'Longevity Rehberi',
      status: 'planned',
      targetServiceSlugs: ['iv-therapies', 'glutathione', 'ozone-therapy'],
    },
    clusters: [
      { slug: 'iv-therapy-guide', title: 'IV terapi', priority: 'P1', targetServiceSlugs: ['iv-therapies'] },
      { slug: 'glutathione-guide', title: 'Glutatyon', priority: 'P1', targetServiceSlugs: ['glutathione'] },
      { slug: 'wellness-guide', title: 'Wellness', priority: 'P2', targetServiceSlugs: ['lpg-treatment', 'healthy-nutrition'] },
    ],
  },
  'eye-health': {
    id: 'eye-health',
    label: 'Göz Sağlığı',
    pillar: {
      slug: 'eye-health-guide',
      title: 'Göz Sağlığı Rehberi',
      status: 'partial',
      targetServiceSlugs: [],
      note: 'Mevcut /tr/goz-hastaliklari.html pillar olarak genişletilebilir',
    },
    clusters: [
      { slug: 'eye-exam-guide', title: 'Göz muayenesi rehberi', priority: 'P2', targetServiceSlugs: [] },
      { slug: 'cataract-guide', title: 'Katarakt rehberi', priority: 'P2', targetServiceSlugs: [], note: 'GERÇEK VERİ GEREKİYOR' },
    ],
  },
};

/** Service slugs with weak inbound internal links (footer/mega-menu only). */
export const ORPHAN_SERVICE_SLUGS = [
  'representatives',
  'production',
  'management',
  'maxx-royal-wellness-bodrum',
  'museum-hotel-wellness-kapadokya',
];

export function getClusterForCategory(category) {
  return SEO_CLUSTERS[category] || null;
}

export function getClusterLinksForServiceSlug(serviceSlug) {
  for (const cluster of Object.values(SEO_CLUSTERS)) {
    const pillarMatch = cluster.pillar.targetServiceSlugs.includes(serviceSlug);
    const clusterMatches = cluster.clusters.filter((item) =>
      item.targetServiceSlugs.includes(serviceSlug),
    );
    if (pillarMatch || clusterMatches.length) {
      return { pillar: cluster.pillar, clusters: clusterMatches, category: cluster.id };
    }
  }
  return null;
}
