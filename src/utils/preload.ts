export const preloadImages = (images: Record<string, string>) => {
  Object.values(images).forEach((src: string) => {
    const img = new Image();
    img.src = src;
  });
};
