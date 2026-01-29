import { getDriveImage } from '../utils/driveHelper';

interface HeroData {
  title?: string;
  subtitle?: string;
  image?: string;
}

interface HeroProps {
  heroData?: HeroData;
}

const Hero = ({ heroData }: HeroProps) => {
  return (
    <section className="relative w-full min-h-screen flex items-center">
      <div className="container mx-auto px-6 flex flex-col-reverse md:flex-row items-center">
        <div className="w-full md:w-1/2">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            {heroData?.title || "Ubah Sampah Jadi Berkah"}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {heroData?.subtitle}
          </p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Mulai Sekarang
          </button>
        </div>
        
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src={getDriveImage(heroData?.image)}
    alt="Hero Illustration"
    className="w-full h-auto object-cover rounded-lg"
    referrerPolicy="no-referrer"
  />
</div>
      </div>
    </section>
  );
};

export default Hero;