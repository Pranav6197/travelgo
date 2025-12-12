import GitHub_Icon from '@/assets/svg/github.svg';
import Discord_Icon from '@/assets/svg/discor.svg';
function footer() {
  const newDate = new Date();
  const year = newDate.getFullYear();

  return (
    <footer className="flex min-h-[6vh] flex-col items-center bg-zinc-900 py-3 pt-10 text-center text-white sm:flex-row sm:justify-center sm:py-3">

      <div className="flex items-center justify-center text-sm">
        <span className="mr-2">&copy;</span>
        {year} Travelgo. All Rights Reserved.
      </div>
    </footer>
  );
}

export default footer;
