export type GalleryItem = {
  id: string;
  src: string;
  type: "image" | "video";
};

export const galleryItems: GalleryItem[] = [
  { id: "gold-gate", src: "/images/gallery/foto-no-portao-de-ouro-dubai.jpeg", type: "image" },
  { id: "desert-eagle", src: "/images/gallery/aguia-no-deserto.jpeg", type: "image" },
  { id: "desert", src: "/images/gallery/deserto.jpeg", type: "image" },
  { id: "sharjah-desert", src: "/images/gallery/eu-no-deserto-de-sharjah.jpeg", type: "image" },
  { id: "burj-selfie", src: "/images/gallery/eu-na-frente-do-burj.jpeg", type: "image" },
  { id: "marina-wheel", src: "/images/gallery/eu-em-marina-no-claw-na-frente-da-roda-gigante.jpeg", type: "image" },
  { id: "burj-video", src: "/images/gallery/video-mostrando-o-burj.mp4", type: "video" },
  { id: "dubai-1", src: "/images/gallery/grupo-1.jpg", type: "image" },
  { id: "dubai-2", src: "/images/gallery/eu-burj.jpeg", type: "image" },
  { id: "dubai-3", src: "/images/gallery/grupo-2.jpeg", type: "image" },
];
