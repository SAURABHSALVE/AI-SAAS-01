import { Badge } from "@/components/ui/badge";

interface MeetingTagsProps {
  tags: string[];
  topics: string[];
}

export const MeetingTags = ({ tags, topics }: MeetingTagsProps) => {
  if (tags.length === 0 && topics.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {topics.map((topic) => (
        <Badge key={`topic-${topic}`} variant="outline" className="font-normal">
          {topic}
        </Badge>
      ))}
      {tags.map((tag) => (
        <Badge key={`tag-${tag}`} variant="secondary" className="font-normal">
          #{tag}
        </Badge>
      ))}
    </div>
  );
};
