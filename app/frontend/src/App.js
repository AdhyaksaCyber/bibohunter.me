"import React from \"react\";
import \"./App.css\";
import { BrowserRouter, Routes, Route } from \"react-router-dom\";
import TopBar from \"./components/site/TopBar\";
import Header from \"./components/site/Header\";
import HeroCarousel from \"./components/site/HeroCarousel\";
import MissionSection from \"./components/site/MissionSection\";
import FeaturedStories from \"./components/site/FeaturedStories\";
import CareersBanner from \"./components/site/CareersBanner\";
import Footer from \"./components/site/Footer\";

const Home = () => {
  return (
    <div className=\"min-h-screen bg-white\">
      <TopBar />
      <Header />
      <main>
        <HeroCarousel />
        <MissionSection />
        <CareersBanner />
        <FeaturedStories />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <div className=\"App\">
      <BrowserRouter>
        <Routes>
          <Route path=\"/\" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
"
