// Сайт живёт в подпапке (на GitHub Pages — /tauber-web/), поэтому внутренние
// адреса собираются через эту функцию, а не пишутся от корня домена.
export const put = (adres) => {
  if (!adres) return adres;
  if (/^(https?:|mailto:|tel:|#)/.test(adres)) return adres;
  const baza = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${baza}/${adres.replace(/^\//, '')}`;
};
