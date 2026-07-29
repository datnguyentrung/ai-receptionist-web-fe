import { avatarColor } from "@/utils/avatarColor";
import { getNameInitials } from "@/utils/getInitials";
import styles from "./Avatar.module.scss";

type AvatarProps = {
  fullName: string;
  fontSize: string;
  fontWeight: number;
  width: string;
  height: string;
  className?: string;
  imageUrl?: string | null;
};

export default function Avatar({
  fullName,
  fontSize,
  fontWeight,
  width,
  height,
  className,
  imageUrl,
}: AvatarProps) {
  const avatarInitials = getNameInitials(fullName);

  return (
    <div
      className={`${styles.avatar} ${className || ""}`}
      style={{
        background: avatarColor(avatarInitials),
        fontSize: fontSize,
        fontWeight: fontWeight,
        width: width,
        height: height,
      }}
    >
      {imageUrl ? <img src={imageUrl} alt="" /> : avatarInitials}
    </div>
  );
}
