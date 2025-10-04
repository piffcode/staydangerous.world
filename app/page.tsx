'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import feather from 'feather-icons';

import '@/styles/home.css';

const navItems = [
  {
    number: '01',
    label: 'HOME',
    href: '/',
    dataPreview: 'home',
    icon: 'home',
    previewTitle: 'Stay Dangerous Productions',
    previewDescription: 'Return to the manifesto and experience the future.',
  },
  {
    number: '02',
    label: 'WORK',
    href: '/work',
    dataPreview: 'work',
    icon: 'film',
    previewTitle: 'See Our Work',
    previewDescription: 'Music videos, campaigns & more',
  },
  {
    number: '03',
    label: 'SERVICES',
    href: '/services',
    dataPreview: 'services',
    icon: 'package',
    previewTitle: 'What We Offer',
    previewDescription: 'Production, coaching, strategy',
  },
  {
    number: '04',
    label: 'START',
    href: '/start',
    dataPreview: 'start',
    icon: 'send',
    previewTitle: 'Start Your Project',
    previewDescription: "Let's create something dangerous",
  },
];

export default function Home() {
  useEffect(() => {
    feather.replace();

    const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement | null;
    const cursor = document.getElementById('customCursor');
    const navLinks = Array.from(document.querySelectorAll<HTMLElement>('.nav-link'));
    const loadingScreen = document.getElementById('loadingScreen');
    const greetingText = document.getElementById('greetingText');
    const currentTime = document.getElementById('currentTime');
    const soundToggle = document.getElementById('soundToggle');
    const particleToggle = document.getElementById('particleToggle');
    const bgVideo = document.getElementById('bgVideo') as HTMLVideoElement | null;

    let particlesEnabled = true;
    let particleAnimation: number | null = null;
    let cursorAnimation: number | null = null;
    let trailTimeout: ReturnType<typeof setTimeout> | null = null;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];
    const cleanupFns: Array<() => void> = [];

    if (canvas) {
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const setCanvasSize = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };

        class Particle {
          x: number;
          y: number;
          vx: number;
          vy: number;
          size: number;
          alpha: number;

          constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
            this.alpha = Math.random() * 0.5;
          }

          update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
          }

          draw() {
            ctx.fillStyle = `rgba(255, 0, 0, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        let particles: Particle[] = [];

        const initParticles = () => {
          particles = [];
          for (let i = 0; i < 100; i += 1) {
            particles.push(new Particle());
          }
        };

        const animateParticles = () => {
          if (!particlesEnabled) {
            particleAnimation = null;
            return;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particles.forEach((particle) => {
            particle.update();
            particle.draw();
          });
          particleAnimation = window.requestAnimationFrame(animateParticles);
        };

        setCanvasSize();
        initParticles();
        animateParticles();

        const handleResize = () => {
          setCanvasSize();
          initParticles();
        };

        window.addEventListener('resize', handleResize);
        cleanupFns.push(() => window.removeEventListener('resize', handleResize));

        if (particleToggle) {
          const icon = particleToggle.querySelector('i');

          const updateIcon = () => {
            if (icon) {
              icon.setAttribute('data-feather', particlesEnabled ? 'zap' : 'zap-off');
              feather.replace();
            }
          };

          const handleParticleToggle = () => {
            particlesEnabled = !particlesEnabled;
            if (!particlesEnabled) {
              if (particleAnimation !== null) {
                window.cancelAnimationFrame(particleAnimation);
                particleAnimation = null;
              }
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else if (particleAnimation === null) {
              animateParticles();
            }
            updateIcon();
          };

          particleToggle.addEventListener('click', handleParticleToggle);
          cleanupFns.push(() => particleToggle.removeEventListener('click', handleParticleToggle));
        }

        cleanupFns.push(() => {
          if (particleAnimation !== null) {
            window.cancelAnimationFrame(particleAnimation);
          }
        });
      }
    }

    if (loadingScreen) {
      const hideLoading = () => loadingScreen.classList.add('hidden');
      timeouts.push(window.setTimeout(hideLoading, 2200));
    }

    if (greetingText && currentTime) {
      const updateTime = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');

        currentTime.textContent = `${hours}:${minutes}`;

        let greeting = 'Good evening';
        if (hours < 12) greeting = 'Good morning';
        else if (hours < 18) greeting = 'Good afternoon';
        greetingText.textContent = greeting;
      };

      updateTime();
      intervals.push(window.setInterval(updateTime, 60000));
    }

    if (cursor) {
      let mouseX = 0;
      let mouseY = 0;
      let cursorX = 0;
      let cursorY = 0;

      const updateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        cursorAnimation = window.requestAnimationFrame(updateCursor);
      };

      const handleMouseMove = (event: MouseEvent) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursor.classList.add('active');

        if (bgVideo) {
          const moveX = (event.clientX / window.innerWidth - 0.5) * 20;
          const moveY = (event.clientY / window.innerHeight - 0.5) * 20;
          bgVideo.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.1)`;
        }

        if (trailTimeout) {
          window.clearTimeout(trailTimeout);
        }

        trailTimeout = window.setTimeout(() => {
          const trail = document.createElement('div');
          trail.className = 'trail';
          trail.style.left = `${event.clientX}px`;
          trail.style.top = `${event.clientY}px`;
          document.body.appendChild(trail);
          timeouts.push(window.setTimeout(() => {
            trail.remove();
          }, 500));
        }, 50);
      };

      document.addEventListener('mousemove', handleMouseMove);
      cleanupFns.push(() => document.removeEventListener('mousemove', handleMouseMove));

      updateCursor();
      cleanupFns.push(() => {
        if (cursorAnimation !== null) {
          window.cancelAnimationFrame(cursorAnimation);
        }
      });
    }

    navLinks.forEach((link) => {
      const element = link;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      };

      const handleMouseLeave = () => {
        element.style.transform = 'translate(0, 0)';
        cursor?.classList.remove('hover');
      };

      const handleMouseEnter = () => {
        cursor?.classList.add('hover');
      };

      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('mouseenter', handleMouseEnter);

      cleanupFns.push(() => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('mouseenter', handleMouseEnter);
      });
    });

    if (soundToggle && bgVideo) {
      bgVideo.muted = true;
      const icon = soundToggle.querySelector('i');

      const updateIcon = () => {
        if (icon) {
          icon.setAttribute('data-feather', bgVideo.muted ? 'volume-x' : 'volume-2');
          feather.replace();
        }
      };

      const handleSoundToggle = () => {
        bgVideo.muted = !bgVideo.muted;
        updateIcon();
      };

      soundToggle.addEventListener('click', handleSoundToggle);
      cleanupFns.push(() => soundToggle.removeEventListener('click', handleSoundToggle));

      updateIcon();
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key >= '1' && event.key <= '4') {
        const index = parseInt(event.key, 10) - 1;
        const link = navLinks[index];
        if (link instanceof HTMLElement) {
          link.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    cleanupFns.push(() => document.removeEventListener('keydown', handleKeydown));

    const entranceTimeout = window.setTimeout(() => {
      const links = document.querySelectorAll<HTMLElement>('.nav-link');
      links.forEach((link, index) => {
        const delay = window.setTimeout(() => {
          link.style.animation = 'fadeInUp 1s ease-out forwards';
          link.style.opacity = '0';
          timeouts.push(window.setTimeout(() => {
            link.style.opacity = '1';
          }, 50));
        }, index * 150);
        timeouts.push(delay);
      });
    }, 2300);
    timeouts.push(entranceTimeout);

    return () => {
      cleanupFns.forEach((fn) => fn());
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      intervals.forEach((intervalId) => window.clearInterval(intervalId));
      if (trailTimeout) {
        window.clearTimeout(trailTimeout);
      }
    };
  }, []);

  return (
    <>
      <canvas id="particleCanvas"></canvas>
      <div id="loadingScreen" className="loading-screen">
        <div className="loader-text">Stay Dangerous Productions</div>
        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
      </div>
      <div className="custom-cursor" id="customCursor"></div>
      <div className="logo">STAY DANGEROUS</div>
      <div className="greeting">
        <div id="greetingText">Good evening</div>
        <div className="time-display" id="currentTime">
          00:00
        </div>
      </div>
      <div className="control-panel">
        <button className="control-btn" id="soundToggle" type="button" aria-label="Toggle sound">
          <i data-feather="volume-x" className="text-white w-6 h-6"></i>
        </button>
        <button className="control-btn" id="particleToggle" type="button" aria-label="Toggle particles">
          <i data-feather="zap" className="text-white w-6 h-6"></i>
        </button>
      </div>
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="video-container">
          <div className="video-overlay"></div>
          <video id="bgVideo" autoPlay muted loop playsInline>
            <source src="https://static.photos/urban/1200x630/42" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <div className="tagline mb-16">
            <p className="text-gray-300 text-sm md:text-base font-light tracking-wider">
              CREATIVE PRODUCTION &amp; ARTIST DEVELOPMENT
            </p>
          </div>

          <nav className="nav-container space-y-0">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link magnetic-wrapper" data-preview={item.dataPreview}>
                <div className="nav-number">{item.number}</div>
                <div className="glitch-wrapper">
                  <div className="glitch-text" data-text={item.label}>
                    {item.label}
                  </div>
                </div>
                <div className="gradient-line"></div>
                <div className="nav-preview">
                  <div className="preview-content">
                    <i data-feather={item.icon} className="text-red-500 w-16 h-16 mb-4 mx-auto"></i>
                    <h3 className="text-white text-2xl font-bold mb-2">{item.previewTitle}</h3>
                    <p className="text-gray-400">{item.previewDescription}</p>
                  </div>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="scroll-indicator" id="scrollIndicator">
          <i data-feather="chevron-down" className="text-red-400 w-8 h-8"></i>
        </div>
      </section>
    </>
  );
}
