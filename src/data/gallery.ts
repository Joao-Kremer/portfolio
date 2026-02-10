export type GalleryItem = {
  id: string;
  src: string;
  type: "image" | "video";
  aspectRatio: number;
};

export const galleryItems: GalleryItem[] = [
  {
    id: "gold-gate",
    src: "/images/gallery/foto-no-portao-de-ouro-dubai.jpeg",
    type: "image",
    aspectRatio: 585 / 1040,
  },
  {
    id: "desert-eagle",
    src: "/images/gallery/aguia-no-deserto.jpeg",
    type: "image",
    aspectRatio: 963 / 1280,
  },
  {
    id: "desert",
    src: "/images/gallery/deserto.jpeg",
    type: "image",
    aspectRatio: 963 / 1280,
  },
  {
    id: "sharjah-desert",
    src: "/images/gallery/eu-no-deserto-de-sharjah.jpeg",
    type: "image",
    aspectRatio: 720 / 1280,
  },
  {
    id: "burj-video",
    src: "/images/gallery/video-mostrando-o-burj.mp4",
    type: "video",
    aspectRatio: 9 / 16,
  },
  {
    id: "burj-selfie",
    src: "/images/gallery/eu-na-frente-do-burj.jpeg",
    type: "image",
    aspectRatio: 1010 / 1320,
  },
  {
    id: "marina-wheel",
    src: "/images/gallery/eu-em-marina-no-claw-na-frente-da-roda-gigante.jpeg",
    type: "image",
    aspectRatio: 2340 / 4160,
  },
  {
    id: "dubai-group",
    src: "/images/gallery/grupo-1.jpg",
    type: "image",
    aspectRatio: 747 / 1024,
  },
  {
    id: "burj-close",
    src: "/images/gallery/eu-burj.jpeg",
    type: "image",
    aspectRatio: 1039 / 1036,
  },
];
