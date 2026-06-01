import Header from '../../components/Header/Header';
import CategoryBar from '../../components/Homepage/CategoryBar/CategoryBar';
import Hero from '../../components/Homepage/HeroSection/Hero';
import Marquee from '../../components/Homepage/Marquee/Marquee';
import Categories from '../../components/Homepage/Categories/Categories';
import Footer from '../../components/Footer/Footer';
import Trending from '../../components/Homepage/Trending/Trending';
import VideoReviews from '../../components/Homepage/VideoReviews/VideoReviews';
import WhyUs from '../../components/Homepage/WhyUs/WhyUs';
import Newsletter from '../../components/Newsletter/Newsletter';

export default function Home() {
  return (
    <>
      <Header />
      <CategoryBar />
      <Hero />
      <Marquee />
      <Categories />
      <Trending />
      <VideoReviews />
      <WhyUs />
      <Newsletter />
      <Footer />
    </>
  );
}
