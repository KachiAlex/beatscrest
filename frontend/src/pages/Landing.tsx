import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, Music, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import AuthModal from '../components/AuthModal';

const features = [
  {
    icon: Music,
    title: 'Upload & Sell Beats',
    description: 'Upload your beats with previews and set your own prices. Automated delivery system ensures instant downloads after purchase.',
  },
  {
    icon: Users,
    title: 'Social Community',
    description: 'Connect with producers and artists. Follow, comment, like, and build your network in the music industry.',
  },
  {
    icon: TrendingUp,
    title: 'Trending Beats',
    description: 'Discover what\'s hot in the music scene. Our algorithm highlights the most popular and trending beats.',
  },
  {
    icon: Star,
    title: 'Producer Dashboard',
    description: 'Track your sales, manage your beats, and analyze your performance with comprehensive analytics.',
  },
];

const testimonials = [
  {
    name: 'DJ ProBeat',
    role: 'Music Producer',
    content: 'BeatCrest has revolutionized how I sell my beats. The platform is intuitive and the community is amazing!',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    verified: true,
  },
  {
    name: 'Melody Queen',
    role: 'R&B Artist',
    content: 'I found my signature sound on BeatCrest. The quality of beats here is unmatched!',
    avatar: '/images/Music.jpg',
    verified: false,
  },
  {
    name: 'Afrobeats King',
    role: 'Producer',
    content: 'The social features help me connect with artists and grow my fan base. Love the platform!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    verified: true,
  },
];

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-7xl font-bold">
              <span className="text-purple-600">
                BeatCrest
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              The ultimate social media and marketplace platform for beat producers and music entertainers across Africa and beyond
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/home">
                  <Play className="mr-2 h-4 w-4" />
                  Explore Beats
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful tools for producers and artists to create, share, and monetize their music
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-purple-600">50K+</h3>
              <p className="text-xl text-muted-foreground">Active Producers</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-blue-600">200K+</h3>
              <p className="text-xl text-muted-foreground">Beats Available</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-green-600">₦2M+</h3>
              <p className="text-xl text-muted-foreground">Earned by Producers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied producers and artists
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">{testimonial.name}</p>
                        {testimonial.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Your Music Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join BeatCrest today and connect with a community of talented producers and artists
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setShowAuthModal(true)}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            Join BeatCrest Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
} 