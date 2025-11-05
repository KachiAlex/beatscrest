export interface ProducerProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  profile_picture: string;
  bio: string;
  headline: string;
  rating: number;
  total_ratings: number;
  account_type: 'producer';
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
  total_beats: number;
  total_sales: number;
  total_plays: number;
  genres: string[];
  location?: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    soundcloud?: string;
  };
}

export const mockProfiles: ProducerProfile[] = [
  {
    id: 1,
    username: "beatmaker_pro",
    email: "beatmaker@beatcrest.com",
    full_name: "Marcus Johnson",
    profile_picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
    bio: "Award-winning producer specializing in street-ready hip hop beats. 10+ years crafting hits for emerging artists. Let's create something legendary together.",
    headline: "Professional Hip Hop Producer | Street Beats Specialist",
    rating: 4.8,
    total_ratings: 342,
    account_type: 'producer',
    is_verified: true,
    followers_count: 12500,
    following_count: 450,
    created_at: "2020-03-15",
    total_beats: 156,
    total_sales: 2340,
    total_plays: 245000,
    genres: ["Hip Hop", "Trap", "R&B"],
    location: "Lagos, Nigeria",
    social_links: {
      instagram: "@beatmaker_pro",
      twitter: "@beatmaker_pro",
      youtube: "BeatMaker Pro",
      soundcloud: "beatmaker-pro"
    }
  },
  {
    id: 2,
    username: "afrobeats_king",
    email: "king@beatcrest.com",
    full_name: "Adeola Ogunleye",
    profile_picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop",
    bio: "Afrobeats royalty creating authentic African sounds with modern production. Fusing traditional rhythms with contemporary vibes. Let's make Africa proud! 🇳🇬",
    headline: "Afrobeats Producer | Award-Winning | Global Recognition",
    rating: 4.9,
    total_ratings: 567,
    account_type: 'producer',
    is_verified: true,
    followers_count: 28900,
    following_count: 320,
    created_at: "2019-08-22",
    total_beats: 289,
    total_sales: 4567,
    total_plays: 892000,
    genres: ["Afrobeats", "Afropop", "Amapiano"],
    location: "Lagos, Nigeria",
    social_links: {
      instagram: "@afrobeats_king",
      twitter: "@afrobeats_king",
      youtube: "Afrobeats King Official",
      soundcloud: "afrobeats-king"
    }
  },
  {
    id: 3,
    username: "melody_master",
    email: "melody@beatcrest.com",
    full_name: "Sarah Mitchell",
    profile_picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop",
    bio: "R&B and soul specialist crafting emotional soundscapes. Creating melodies that touch hearts and move souls. Every beat tells a story.",
    headline: "R&B & Soul Producer | Melodic Storyteller",
    rating: 4.7,
    total_ratings: 189,
    account_type: 'producer',
    is_verified: true,
    followers_count: 8900,
    following_count: 670,
    created_at: "2021-01-10",
    total_beats: 98,
    total_sales: 1234,
    total_plays: 156000,
    genres: ["R&B", "Soul", "Jazz"],
    location: "London, UK",
    social_links: {
      instagram: "@melody_master",
      twitter: "@melody_master",
      youtube: "Melody Master",
      soundcloud: "melody-master"
    }
  },
  {
    id: 4,
    username: "trap_master",
    email: "trap@beatcrest.com",
    full_name: "James Rodriguez",
    profile_picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop",
    bio: "Hard-hitting trap beats that hit different. Specializing in 808s, heavy bass, and crisp hi-hats. Making bangers for the streets.",
    headline: "Trap Producer | 808 Specialist | Street Certified",
    rating: 4.6,
    total_ratings: 412,
    account_type: 'producer',
    is_verified: true,
    followers_count: 16700,
    following_count: 280,
    created_at: "2020-11-05",
    total_beats: 203,
    total_sales: 3456,
    total_plays: 567000,
    genres: ["Trap", "Hip Hop", "Drill"],
    location: "Atlanta, USA",
    social_links: {
      instagram: "@trap_master",
      twitter: "@trap_master",
      youtube: "Trap Master Beats",
      soundcloud: "trap-master"
    }
  },
  {
    id: 5,
    username: "DJ ProBeat",
    email: "djpro@beatcrest.com",
    full_name: "David Okafor",
    profile_picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop",
    bio: "Versatile producer and DJ creating beats across multiple genres. From hip hop to electronic, I bring the energy to every track.",
    headline: "Multi-Genre Producer | DJ | Beat Creator",
    rating: 4.5,
    total_ratings: 234,
    account_type: 'producer',
    is_verified: false,
    followers_count: 5600,
    following_count: 890,
    created_at: "2022-06-18",
    total_beats: 67,
    total_sales: 456,
    total_plays: 89000,
    genres: ["Hip Hop", "Electronic", "Pop"],
    location: "Abuja, Nigeria",
    social_links: {
      instagram: "@djprobeat",
      twitter: "@djprobeat",
      youtube: "DJ ProBeat",
      soundcloud: "dj-probeat"
    }
  }
];

// Helper function to get profile by username
export const getProfileByUsername = (username: string): ProducerProfile | undefined => {
  return mockProfiles.find(profile => profile.username === username);
};

// Helper function to get profile by id
export const getProfileById = (id: number): ProducerProfile | undefined => {
  return mockProfiles.find(profile => profile.id === id);
};

