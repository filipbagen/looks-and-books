import { useRef, useEffect, useState, type ReactNode } from 'react';

interface AnimatedSectionProps {
  visible: boolean;
  children: ReactNode;
  id?: string;
}

export default function AnimatedSection({ visible, children, id }: AnimatedSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (visible && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && contentRef.current) {
      const observer = new ResizeObserver(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight);
        }
      });
      observer.observe(contentRef.current);
      return () => observer.disconnect();
    }
  }, [visible]);

  return (
    <div
      id={id}
      className="overflow-hidden w-full"
      style={{
        height: visible ? height : 0,
        marginBottom: visible ? 56 : 0,
        transition: 'height 620ms ease, margin-bottom 620ms ease',
      }}
    >
      <div ref={contentRef} className="flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}
