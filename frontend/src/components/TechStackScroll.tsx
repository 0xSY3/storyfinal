"use client"

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const TechStackScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    let animationId: number
    let position = 0
    const speed = 0.5 // pixels per frame

    const animate = () => {
      position -= speed
      
      // Reset position when one set has fully scrolled
      if (position <= -scrollElement.scrollWidth / 2) {
        position = 0
      }
      
      scrollElement.style.transform = `translateX(${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isMounted])

  const logos = [
    {
      name: "DeBridge",
      logo: (
        <svg className="w-full h-full" viewBox="0 0 91 52" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M78.5778 52H90.6667C90.6667 51.4943 90.6584 50.9906 90.642 50.4889H81.2109L90.5435 48.6325C90.4652 47.5662 90.35 46.5101 90.1992 45.4655L81.352 47.2253L89.9053 43.6824C89.6991 42.5702 89.4522 41.4723 89.1664 40.3902L80.7959 43.8573L88.6554 38.6058C88.301 37.4583 87.9023 36.3302 87.4612 35.2237L79.5077 40.538L86.6745 33.3713C86.1491 32.207 85.5759 31.0689 84.9574 29.9595L77.4914 37.4255L83.7947 27.992C83.0747 26.8409 82.3044 25.7245 81.487 24.6458L74.7814 34.6814L79.804 22.5558C78.8698 21.4631 77.8845 20.4154 76.8518 19.4163L71.7282 31.7858C76.0244 37.3871 78.5778 44.3954 78.5778 52ZM12.0889 52C12.0889 51.0843 12.1259 50.1772 12.1985 49.2802H0.0802429C0.0269992 50.18 0 51.0869 0 52H12.0889ZM12.9956 44.2561L1.13017 41.8959C1.52612 40.1565 2.0221 38.4551 2.61175 36.7981L14.6459 39.1919C13.9662 40.8184 13.4121 42.5106 12.9956 44.2561ZM16.952 34.6792L5.6808 30.0105C6.52799 28.4861 7.46054 27.0156 8.47199 25.6056L20.0575 30.4045C18.9139 31.7417 17.8745 33.1709 16.952 34.6792ZM23.4882 26.9398L13.1744 20.0483C14.3837 18.8312 15.6615 17.6824 17.0017 16.6082L27.743 23.7853C26.2401 24.7243 24.8176 25.78 23.4882 26.9398ZM31.7225 21.6605L22.7471 12.6851C24.214 11.8405 25.7326 11.0757 27.2971 10.3965L36.7696 19.869C35.0268 20.3323 33.3404 20.9336 31.7225 21.6605ZM40.6682 19.0803L33.4289 8.24589C35.0399 7.80862 36.6865 7.45795 38.3634 7.19918L46.0908 18.764C45.839 18.7584 45.5865 18.7556 45.3333 18.7556C43.75 18.7556 42.1925 18.8663 40.6682 19.0803ZM49.3577 18.9967L44.2557 6.67924C44.6139 6.67089 44.9731 6.66669 45.3333 6.66669C46.6445 6.66669 47.9426 6.72235 49.2256 6.83144L54.7214 20.0996C52.9881 19.5904 51.196 19.2185 49.3577 18.9967ZM57.0577 20.882L54.4109 7.57574C56.014 7.90155 57.5863 8.31195 59.123 8.80208L61.9917 23.224C60.4237 22.3144 58.7745 21.5292 57.0577 20.882ZM63.366 24.0665V10.395C64.8174 11.0249 66.2293 11.7285 67.5971 12.5012V27.3113C66.2783 26.1212 64.8636 25.0353 63.366 24.0665ZM68.2013 27.8701L70.8552 14.5281C72.1065 15.382 73.3129 16.297 74.47 17.2687L71.6122 31.6355C70.5718 30.2948 69.4311 29.0359 68.2013 27.8701Z" fill="#FBFF3A"/>
        </svg>
      ),
      bgColor: "bg-black"
    },
    {
      name: "Tomo",
      logo: (
        <svg className="w-full h-full" viewBox="0 0 39 32" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18.6097 8.15324C19.0241 7.67736 19.7634 7.67735 20.1778 8.15324L21.6859 9.88508C21.9967 10.242 22.5093 10.344 22.9331 10.1332L24.9891 9.11027C25.5541 8.82919 26.2372 9.11213 26.4379 9.71037L27.1685 11.8875C27.319 12.3362 27.7536 12.6266 28.2258 12.594L30.5167 12.4358C31.1463 12.3923 31.6691 12.9151 31.6256 13.5446L31.4674 15.8356C31.4348 16.3077 31.7252 16.7423 32.1738 16.8929L34.351 17.6234C34.9492 17.8242 35.2321 18.5072 34.9511 19.0722L33.9282 21.1283C33.7174 21.552 33.8194 22.0646 34.1763 22.3754L35.9081 23.8835C36.384 24.2979 36.384 25.0373 35.9081 25.4517L34.2917 26.8593C33.8839 27.2144 33.8164 27.8227 34.1364 28.2586L35.1776 29.677C35.6818 30.3637 35.1914 31.3319 34.3396 31.3319H31.412H26.229C28.8814 30.3735 30.1008 27.3034 28.8174 24.7829C27.4137 22.0259 23.7746 21.3551 21.4801 23.4302L21.3372 23.5594C20.23 24.5607 18.5444 24.5607 17.4373 23.5594L17.2944 23.4302C14.9999 21.3551 11.3608 22.0259 9.95706 24.7829C8.6737 27.3034 9.89308 30.3735 12.5455 31.3319H7.37547H4.44792C3.59607 31.3319 3.10572 30.3637 3.60983 29.677L4.65111 28.2586C4.9711 27.8227 4.90357 27.2144 4.4958 26.8593L2.87937 25.4517C2.40349 25.0373 2.40349 24.2979 2.87937 23.8835L4.61121 22.3754C4.96813 22.0646 5.0701 21.552 4.85929 21.1283L3.8364 19.0722C3.55533 18.5072 3.83826 17.8242 4.43651 17.6234L6.61364 16.8929C7.06233 16.7423 7.35271 16.3077 7.32011 15.8356L7.1619 13.5446C7.11842 12.9151 7.64121 12.3923 8.27074 12.4358L10.5617 12.594C11.0339 12.6266 11.4685 12.3362 11.619 11.8875L12.3496 9.71037C12.5503 9.11213 13.2334 8.82919 13.7984 9.11027L15.8544 10.1332C16.2781 10.344 16.7908 10.242 17.1016 9.88508L18.6097 8.15324ZM19.4937 31.0863C20.7496 31.0863 21.7677 30.4291 21.7677 29.6184C21.7677 28.8078 20.7496 28.1506 19.4937 28.1506C18.2378 28.1506 17.2197 28.8078 17.2197 29.6184C17.2197 30.4291 18.2378 31.0863 19.4937 31.0863ZM15.3817 26.7983C15.3817 27.5467 14.775 28.1533 14.0267 28.1533C13.2784 28.1533 12.6717 27.5467 12.6717 26.7983C12.6717 26.05 13.2784 25.4433 14.0267 25.4433C14.775 25.4433 15.3817 26.05 15.3817 26.7983ZM24.9631 28.1533C25.7114 28.1533 26.3181 27.5467 26.3181 26.7983C26.3181 26.05 25.7114 25.4433 24.9631 25.4433C24.2147 25.4433 23.6081 26.05 23.6081 26.7983C23.6081 27.5467 24.2147 28.1533 24.9631 28.1533Z" fill="#FE3C9C"/>
        </svg>
      ),
      bgColor: "bg-white"
    },
    {
      name: "Yakoa",
      logo: (
        <Image
          src="/yakoa.webp"
          alt="Yakoa"
          width={36}
          height={36}
          className="w-full h-full object-contain"
        />
      ),
      bgColor: "bg-gray-900"
    },
    {
      name: "Story",
      logo: (
        <svg className="w-full h-full text-black" viewBox="0 0 401 92" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M34.9,92C54,92,69.5,80.5,69.5,61.1C69.5,43,56,30.3,34.9,30.3v13.4c-9.7,0-16.9-4.3-16.9-13.1   c0-8.8,6.2-14,17.4-14c9.2,0,14.7,3.8,16.1,8.8h17C67.2,11.4,54,0,35,0C14.9,0,0.6,12.6,0.6,31c0,18.4,14.9,29.5,34.3,29.5V47.8   c10.3,0,17.4,4.6,17.4,13.7c0,9-7.2,14.1-17.3,14.1c-9.1,0-15.4-4-17.3-9.5H0C2.5,80.6,15.8,92,34.9,92z"/>
          <polygon points="101,90 120.3,90 120.3,19.5 147.9,19.5 147.9,2.1 73.4,2.1 73.4,19.5 101,19.5"/>
          <path d="M192.9,92v-9c20.3,0,35.5-15.9,35.5-37h9.4c0-25-19.4-46-44.9-46c-27.4,0-45.1,19.1-45.1,46   C147.8,71,167.4,92,192.9,92z M220.5,46h-8.6c0,11.4-8.4,19.8-19,19.8v8.6c-15.5,0-26.7-12.9-26.7-28.3c0-16.7,10-28,26.7-28   C208.4,18,220.5,29.9,220.5,46z"/>
          <path d="M297.8,32.5c0,9-4.9,13.4-14.2,13.4h-17.8V19.6H283C292.3,19.6,297.8,23.5,297.8,32.5z M246.8,90h19.1V63.3   h17.8c1.1,0,2.1-0.1,3.2-0.1L300.7,90h20.4L304,57.8c8.1-5.6,12.1-14.8,12.1-25.2c0-17-10.4-30.4-33.1-30.4h-36.2V90z"/>
          <path d="M354.8,90h18.4V52.9L401,2.2h-21.2l-25,46.9V90z M338.7,40.6h20.7L338.7,2.2h-20.7L338.7,40.6z"/>
        </svg>
      ),
      bgColor: "bg-white"
    }
  ]

  return (
    <section className="py-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-slate-200/50 border-b border-slate-200/50 overflow-hidden relative">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex items-center whitespace-nowrap will-change-transform"
          style={{ width: 'fit-content' }}
        >
          {/* Multiple sets for seamless looping */}
          {[...Array(7)].map((_, setIndex) => (
            <div key={`set-${setIndex}`} className={`flex items-center space-x-16 ${setIndex > 0 ? 'ml-16' : ''}`}>
              {logos.map((tech, index) => (
                <div key={`set${setIndex}-${index}`} className="flex items-center space-x-3 min-w-max group">
                  <div className={`w-14 h-14 ${tech.bgColor} rounded-2xl border-2 border-slate-200/60 shadow-sm hover:shadow-md flex items-center justify-center p-2 transition-all duration-300 group-hover:scale-110 group-hover:border-green-200`}>
                    {tech.logo}
                  </div>
                  <span className="font-bold text-slate-700 text-sm tracking-wide group-hover:text-green-600 transition-colors duration-300">{tech.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TechStackScroll