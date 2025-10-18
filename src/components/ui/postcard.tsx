import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle } from "lucide-react"
import ImageCarousel from "@/modules/visitor/visitor-experience-carousel"

interface Post {
  post_id: string
  user_uid: string
  firstName?: string
  lastName?: string
  visitorImg: string
  content: string
  images: string[]
  created_at: string
}

interface PostCardProps {
  post: Post
  onLike?: () => void // ✅ added optional onLike prop
}

const PostCard = ({ post, onLike }: PostCardProps) => {
  // State para sa visual like effect (red heart)
  const [liked, setLiked] = useState(false)

  const handleLikeClick = () => {
    // Visual effect lang
    setLiked(!liked)

    // Trigger callback kung meron
    if (onLike) {
      onLike()
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage
            src={post.visitorImg || "/placeholder.svg?height=40&width=40"}
            alt={post.firstName}
          />
          <AvatarFallback>{post.firstName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.firstName}</span>
            <span className="text-xs text-muted-foreground">@{post.lastName}</span>
          </div>
          <span className="text-xs text-muted-foreground">{post.created_at}</span>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-0">
        {post.content && (
          <div className="px-4 pb-4">
            <p className="text-sm">{post.content}</p>
          </div>
        )}

        {/* Image Carousel */}
        {post.images && post.images.length > 0 && (
          <div className="w-full">
            <ImageCarousel
              images={post.images}
              aspectRatio="square"
              height="h-80"
            />
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4">
        <div className="flex items-center gap-6 w-full">
          {/* Like button */}
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 transition-colors ${
              liked ? "text-red-500" : "text-muted-foreground"
            }`}
            onClick={handleLikeClick} // ✅ now calls both visual and parent callback
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                liked ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </Button>

          {/* Comment button (optional, no function yet) */}
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foregrou
