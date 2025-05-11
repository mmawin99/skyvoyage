import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Existing Card components
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-2 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "pt-2",
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-2", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex pb-6 items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

// New CardImage component
interface CardImageProps extends Omit<React.ComponentProps<typeof Image>, "src"> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide" | string;
  width?: number;
  height?: number;
  fill?: boolean;
  position?: "top" | "left" | "right";
}

function CardImage({
  src,
  alt,
  className,
  aspectRatio = "square",
  width = 500,
  height = 500,
  fill = false,
  position = "top",
  ...props
}: CardImageProps) {
  const getAspectRatio = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      case "portrait":
        return "aspect-[3/4]";
      case "wide":
        return "aspect-[16/9]";
      default:
        return aspectRatio;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "w-full rounded-t-xl overflow-hidden";
      case "left":
        return "rounded-l-xl overflow-hidden";
      case "right":
        return "rounded-r-xl overflow-hidden";
      default:
        return "w-full rounded-t-xl overflow-hidden";
    }
  };

  return (
    <div
      data-slot="card-image"
      className={cn(
        getPositionClasses(),
        getAspectRatio(),
        "relative",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("object-cover", fill ? "fill" : "w-full h-full")}
        {...props}
      />
    </div>
  );
}

// Example usage components
function ProductCard() {
  return (
    <div className="w-80">
      <Card className="p-0 overflow-hidden">
        <CardImage 
          src="./meal.jpg" 
          alt="Delicious meal" 
          aspectRatio="video"
          position="top"
        />
        <CardHeader>
          <CardTitle>Gourmet Dining Experience</CardTitle>
          <CardDescription>Chef-prepared meal delivered to your door</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Enjoy our exquisite 3-course meal featuring seasonal ingredients and expert preparation.</p>
          <div className="mt-4 font-bold">$49.99</div>
        </CardContent>
        <CardFooter>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md w-full">Add to Cart</button>
        </CardFooter>
      </Card>
    </div>
  );
}

function BlogCardLeftImage() {
  return (
    <div className="w-full max-w-3xl">
      <Card className="p-0 flex-row overflow-hidden">
        <CardImage 
          src="./seat.jpg" 
          alt="Comfortable chair" 
          position="left"
          className="w-1/3"
        />
        <div className="flex flex-col w-2/3">
          <CardHeader>
            <CardTitle>Modern Interior Design Trends</CardTitle>
            <CardDescription>By Sarah Johnson • April 24, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Discover the latest furniture trends that are taking the design world by storm. From minimalist seating to statement pieces...</p>
          </CardContent>
          <CardFooter>
            <button className="px-4 py-2 bg-gray-200 rounded-md">Read More</button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}

function BlogCardRightImage() {
  return (
    <div className="w-full max-w-3xl">
      <Card className="p-0 flex-row overflow-hidden">
        <div className="flex flex-col w-2/3">
          <CardHeader>
            <CardTitle>Ergonomic Home Office Setup</CardTitle>
            <CardDescription>By James Wilson • April 22, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create a comfortable and productive workspace at home with these ergonomic furniture recommendations and arrangement tips...</p>
          </CardContent>
          <CardFooter>
            <button className="px-4 py-2 bg-gray-200 rounded-md">Read More</button>
          </CardFooter>
        </div>
        <CardImage 
          src="./seat.jpg" 
          alt="Ergonomic office chair" 
          position="right"
          className="w-1/3"
        />
      </Card>
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardImage,
  ProductCard,
  BlogCardLeftImage,
  BlogCardRightImage
}