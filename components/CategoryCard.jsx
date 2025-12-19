import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default function CategoryCard({ category }) {
  return (
    <Link 
      href={category.slug ? `/categories/${category.slug}` : '#'}
      className="group block"
    >
      <div className="glass rounded-2xl overflow-hidden shadow-soft border border-white/50 hover:shadow-lg transition-all duration-200 active:scale-95 h-full flex flex-col">
        <div className="relative h-40 w-full overflow-hidden">
          <Image 
            src={category.image || "/icons/placeholder.png"} 
            alt={category.title} 
            fill 
            style={{ objectFit: "cover" }}
            className="group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3">
            <h4 className="text-white font-bold text-lg drop-shadow-lg">{category.title}</h4>
          </div>
        </div>
        {category.description && (
          <div className="p-3 flex-1">
            <p className="text-xs text-indigo-600 line-clamp-2">{category.description}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
