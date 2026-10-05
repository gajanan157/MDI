// Comments are stored as metadata only - not displayed in UI
interface CommentsArrayRendererProps {
  fieldKey: string;
  comments: Array<any>;
  onValueChange?: (comments: Array<any>) => void;
  isCommentEditable?: boolean;
}

export default function CommentsArrayRenderer(_props: CommentsArrayRendererProps) {
  // Don't display comments in UI - comments are stored as metadata only
  // Return null to hide the comment display section
  return null;
}

