
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar, Menu, Search, Star, X, Scissors, Users, MapPin } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      title: "Find Your Perfect Salon",
      description: "Browse through hundreds of salons and filter by location, services, and reviews.",
      icon: <Search className="h-10 w-10 text-primary" />,
    },
    {
      title: "Book in Seconds",
      description: "No more phone calls. Find available slots and book your appointment instantly.",
      icon: <Calendar className="h-10 w-10 text-primary" />,
    },
    {
      title: "Verified Reviews",
      description: "Read authentic reviews from real clients before making your choice.",
      icon: <Star className="h-10 w-10 text-primary" />,
    },
  ];

  const popularSalons = [
    {
      id: "salon-1",
      name: "Chic Hair Studio",
      image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      location: "New York, NY",
      rating: 4.8,
      services: ["Haircuts", "Coloring", "Styling"]
    },
    {
      id: "salon-2",
      name: "Glamour Beauty Bar",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      location: "Brooklyn, NY",
      rating: 4.6,
      services: ["Makeup", "Nails", "Hair Treatments"]
    },
    {
      id: "salon-3",
      name: "Elite Barber Shop",
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      location: "Queens, NY",
      rating: 4.9,
      services: ["Men's Cuts", "Beard Trim", "Hot Towel Shave"]
    },
  ];

  const testimonials = [
    {
      quote: "BeautyCraft has completely changed how I book my beauty appointments. It's so convenient!",
      author: "Emma Watson",
      role: "Client",
    },
    {
      quote: "Since joining BeautyCraft, my salon has seen a 30% increase in new clients. The platform is amazing!",
      author: "John Smith",
      role: "Salon Owner",
    },
    {
      quote: "I love how easy it is to find available time slots that fit my busy schedule.",
      author: "Sarah Johnson",
      role: "Client",
    },
  ];

  const redirectToRole = () => {
    if (user) {
      navigate(user.role === "client" ? "/client" : "/partner");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">
              BeautyCraft
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">How it works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Testimonials</a>
              
              {user ? (
                <Button onClick={redirectToRole}>
                  Go to {user.role === "client" ? "Dashboard" : "Partner Dashboard"}
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" onClick={() => navigate("/login")}>
                    Sign in
                  </Button>
                  <Button onClick={() => navigate("/register")}>
                    Sign up
                  </Button>
                </div>
              )}
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <span className="text-2xl font-bold text-primary">BeautyCraft</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="p-4">
            <div className="flex flex-col space-y-4">
              <a 
                href="#features" 
                className="text-gray-600 hover:text-primary p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-gray-600 hover:text-primary p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a 
                href="#testimonials" 
                className="text-gray-600 hover:text-primary p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              
              {user ? (
                <Button onClick={redirectToRole} className="mt-4">
                  Go to {user.role === "client" ? "Dashboard" : "Partner Dashboard"}
                </Button>
              ) : (
                <div className="flex flex-col space-y-2 mt-4">
                  <Button variant="outline" onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}>
                    Sign in
                  </Button>
                  <Button onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/register");
                  }}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-light to-white py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Book Beauty Services <span className="text-primary">Instantly</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-lg">
                Connect with the best beauty salons in your area. Book appointments online, manage your schedule, and enjoy great beauty services.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="rounded-lg shadow-xl overflow-hidden bg-white p-2">
                <img 
                  src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                  alt="Salon appointment booking" 
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-primary-dark opacity-20"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary opacity-10"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Salons Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Popular Salons</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover top-rated beauty salons in your area
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {popularSalons.map((salon) => (
              <Card key={salon.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={salon.image} 
                    alt={salon.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105" 
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-1">{salon.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium text-sm">{salon.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-start mb-3">
                    <MapPin className="w-4 h-4 text-gray-400 mr-1 mt-0.5" />
                    <span className="text-gray-500 text-sm">{salon.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {salon.services.map((service, idx) => (
                      <span key={idx} className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                        {service}
                      </span>
                    ))}
                  </div>
                  <Button 
                    onClick={() => navigate("/register")} 
                    className="w-full"
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/register")}
            >
              Explore All Salons
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose BeautyCraft</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform makes finding and booking beauty services simple, fast, and convenient.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-lg shadow-md border border-gray-100 transition-all hover:shadow-lg"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Book your next salon appointment in three simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Find a Salon</h3>
              <p className="text-gray-600">
                Browse through our curated list of quality salons in your area.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose a Service</h3>
              <p className="text-gray-600">
                Select your desired service and see available time slots in real-time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Book & Confirm</h3>
              <p className="text-gray-600">
                Book your appointment and receive an instant confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* App Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-4">For Clients and Salons</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">For Clients</h3>
                    <p className="text-gray-600">
                      Discover salons, book appointments, and manage your beauty schedule all in one place.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full text-primary">
                    <Scissors className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">For Salons</h3>
                    <p className="text-gray-600">
                      Manage your bookings, staff schedules, and grow your business with our salon management tools.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/register")}
                  >
                    Get Started Free
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                    alt="App Preview" 
                    className="max-w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-primary opacity-10"></div>
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary-dark opacity-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who love using BeautyCraft.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-8 rounded-lg border border-gray-100 relative"
              >
                <div className="text-5xl text-primary opacity-20 absolute top-4 left-4">"</div>
                <div className="relative z-10">
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to transform your beauty experience?
          </h2>
          <p className="text-xl text-white opacity-80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying the convenience of BeautyCraft.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 bg-white text-primary hover:bg-gray-100"
              onClick={() => navigate("/register")}
            >
              Create an Account
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 border-white text-white hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-xl font-bold mb-4">BeautyCraft</h3>
              <p className="text-gray-400">
                Making beauty services accessible to everyone, everywhere.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} BeautyCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
