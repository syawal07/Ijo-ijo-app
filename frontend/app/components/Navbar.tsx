import Link from 'next/link';
import { getDriveImage } from '../utils/driveHelper';

interface ProjectData {
  emojiLogo?: string;
  name?: string;
}

interface NavbarProps {
  project?: ProjectData;
}

const Navbar = ({ project }: NavbarProps) => {
  return (
    <nav className="w-full bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
  {project?.emojiLogo && (project.emojiLogo.includes('http') || project.emojiLogo.includes('/')) ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={getDriveImage(project.emojiLogo)}
      alt="Logo"
      className="h-10 w-auto object-contain"
      referrerPolicy="no-referrer"
    />
            ) : (
              <span className="text-2xl font-bold">
                {project?.emojiLogo || "IJO PROJECT"}
              </span>
            )}
            <span className="text-xl font-bold text-green-600 hidden md:block">
              {project?.name || "IJO PROJECT"}
            </span>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;