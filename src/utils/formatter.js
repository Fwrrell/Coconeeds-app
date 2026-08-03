export const formatRupiah = (value) => {
  const numValue = Number(value);

  if (isNaN(numValue)) return value;

  if (numValue >= 1000000000000) {
    return `Rp ${(numValue / 1000000000000).toLocaleString("id-ID")} T`;
  } else if (numValue >= 1000000000) {
    return `Rp ${(numValue / 1000000000).toLocaleString("id-ID")} M`;
  } else if (numValue >= 1000000) {
    return `Rp ${(numValue / 1000000).toLocaleString("id-ID")} jt`;
  } else if (numValue >= 1000) {
    return `Rp ${(numValue / 1000).toLocaleString("id-ID")} rb`;
  }

  return `Rp ${numValue.toLocaleString("id-ID")}`;
};
