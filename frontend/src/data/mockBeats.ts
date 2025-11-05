export interface Beat {
  id: number;
  title: string;
  producer: string;
  producerUsername: string;
  producerId: number; // Reference to producer profile
  price: number;
  genre: string;
  bpm: number;
  key: string;
  cover: string;
  plays: number;
  likes: number;
  downloads: number;
  date: string;
  verified: boolean;
  description: string;
  tags: string[];
  isLiked: boolean;
}

export const mockBeats: Beat[] = [
  { 
    id: 1, 
    title: "Street Hustle", 
    producer: "beatmaker_pro", 
    producerUsername: "beatmaker_pro", 
    producerId: 1, // Linked to Marcus Johnson profile
    price: 45000, 
    genre: "Hip Hop", 
    bpm: 95, 
    key: "D Minor", 
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop", 
    plays: 1520, 
    likes: 234, 
    downloads: 45, 
    date: "2/1/2024", 
    verified: true, 
    description: "Gritty street beat with dark melodies and punchy drums.", 
    tags: ["#dark", "#street"], 
    isLiked: false 
  },
  { 
    id: 2, 
    title: "Lagos Nights", 
    producer: "afrobeats_king", 
    producerUsername: "afrobeats_king", 
    producerId: 2, // Linked to Adeola Ogunleye profile
    price: 35000, 
    genre: "Afrobeats", 
    bpm: 108, 
    key: "G Major", 
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop", 
    plays: 3240, 
    likes: 567, 
    downloads: 89, 
    date: "2/5/2024", 
    verified: true, 
    description: "Smooth Afrobeats with jazz influences and live instruments.", 
    tags: ["#afrobeats", "#jazz"], 
    isLiked: false 
  },
  { 
    id: 3, 
    title: "Melodic Dreams", 
    producer: "melody_master", 
    producerUsername: "melody_master", 
    producerId: 3, // Linked to Sarah Mitchell profile
    price: 55000, 
    genre: "R&B", 
    bpm: 85, 
    key: "F Major", 
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&auto=format&fit=crop", 
    plays: 890, 
    likes: 123, 
    downloads: 23, 
    date: "2/10/2024", 
    verified: true, 
    description: "Soulful R&B with smooth melodies and emotional depth.", 
    tags: ["#melodic", "#rnb"], 
    isLiked: false 
  },
  { 
    id: 4, 
    title: "Trap Nation", 
    producer: "trap_master", 
    producerUsername: "trap_master", 
    producerId: 4, // Linked to James Rodriguez profile
    price: 40000, 
    genre: "Trap", 
    bpm: 140, 
    key: "F Major", 
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop", 
    plays: 2100, 
    likes: 345, 
    downloads: 67, 
    date: "2/15/2024", 
    verified: true, 
    description: "Hard-hitting trap beat with heavy 808s and crisp hi-hats.", 
    tags: ["#trap", "#hip-hop"], 
    isLiked: false 
  },
  { 
    id: 5, 
    title: "Midnight Groove", 
    producer: "DJ ProBeat", 
    producerUsername: "DJ ProBeat", 
    producerId: 5, // Linked to David Okafor profile
    price: 45000, 
    genre: "Hip Hop", 
    bpm: 140, 
    key: "F Major", 
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop", 
    plays: 1800, 
    likes: 289, 
    downloads: 52, 
    date: "2/20/2024", 
    verified: false, 
    description: "Smooth hip hop beat perfect for late-night vibes.", 
    tags: ["#hip-hop", "#groove"], 
    isLiked: false 
  }
];

