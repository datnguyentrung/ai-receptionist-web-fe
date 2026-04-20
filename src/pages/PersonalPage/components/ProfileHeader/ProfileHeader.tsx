import coverImage from "@/assets/taekwondo.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Award,
  Calendar,
  Edit2,
  KeyRound,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import type { Coach, Student } from "../../mockData";
import "./ProfileHeader.scss";

export function ProfileHeader({ profile }: { profile: Student | Coach }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);

  return (
    <>
      <Card className="profile-header-card">
        <div className="profile-header__cover">
          <img
            src={coverImage}
            alt="Center Cover"
            className="profile-header__cover-image"
          />
          <div className="profile-header__cover-overlay" />
          <div className="profile-header__avatar-wrap">
            <div className="profile-header__avatar-box">
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="profile-header__avatar-image"
              />
              <Badge
                variant={
                  profile.status === "Active" ? "default" : "destructive"
                }
                className="profile-header__status-badge"
              >
                {profile.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="profile-header__content">
          <div className="profile-header__identity">
            <h2 className="profile-header__name">{profile.fullName}</h2>
            <div className="profile-header__chips">
              <div className="profile-header__belt-chip">
                <Award size={16} className="profile-header__belt-icon" />
                <span className="profile-header__belt-text">
                  {profile.belt}
                </span>
              </div>
              <Badge variant="outline" className="profile-header__role-badge">
                {profile.role === "STUDENT"
                  ? "Học viên"
                  : profile.role === "MANAGER"
                    ? "Quản lý"
                    : "Huấn luyện viên"}
              </Badge>
            </div>
          </div>

          <div className="profile-header__details-grid">
            <div className="profile-header__detail-item">
              <div className="profile-header__detail-icon profile-header__detail-icon--blue">
                <User size={16} />
              </div>
              <div className="profile-header__detail-text">
                <p className="profile-header__detail-label">Giới tính</p>
                <p className="profile-header__detail-value">{profile.gender}</p>
              </div>
            </div>

            <div className="profile-header__detail-item">
              <div className="profile-header__detail-icon profile-header__detail-icon--emerald">
                <Calendar size={16} />
              </div>
              <div className="profile-header__detail-text">
                <p className="profile-header__detail-label">Ngày sinh</p>
                <p className="profile-header__detail-value">
                  {new Date(profile.birthDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="profile-header__detail-item">
              <div className="profile-header__detail-icon profile-header__detail-icon--slate">
                <Phone size={16} />
              </div>
              <div className="profile-header__detail-text">
                <p className="profile-header__detail-label">Điện thoại</p>
                <p className="profile-header__detail-value">
                  {profile.phoneNumber}
                </p>
              </div>
            </div>

            <div className="profile-header__detail-item">
              <div className="profile-header__detail-icon profile-header__detail-icon--rose">
                <Mail size={16} />
              </div>
              <div className="profile-header__detail-text">
                <p className="profile-header__detail-label">Email</p>
                <p className="profile-header__detail-value profile-header__detail-value--truncate">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          <div className="profile-header__actions">
            <Button
              variant="outline"
              className="profile-header__action-btn profile-header__action-btn--edit"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 size={16} />
              <span className="profile-header__action-text">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              className="profile-header__action-btn profile-header__action-btn--password"
              onClick={() => setIsPassOpen(true)}
            >
              <KeyRound size={16} />
              <span className="profile-header__action-text">Đổi mật khẩu</span>
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="profile-header__dialog">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa liên hệ</DialogTitle>
          </DialogHeader>
          <form
            className="profile-header__form"
            onSubmit={(e) => {
              e.preventDefault();
              setIsEditOpen(false);
            }}
          >
            <div>
              <label className="profile-header__label">Số điện thoại</label>
              <Input defaultValue={profile.phoneNumber} type="tel" />
            </div>
            <div>
              <label className="profile-header__label">Email</label>
              <Input defaultValue={profile.email} type="email" />
            </div>
            <div className="profile-header__dialog-actions">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsEditOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Lưu thay đổi</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPassOpen} onOpenChange={setIsPassOpen}>
        <DialogContent className="profile-header__dialog">
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
          </DialogHeader>
          <form
            className="profile-header__form"
            onSubmit={(e) => {
              e.preventDefault();
              setIsPassOpen(false);
            }}
          >
            <div>
              <label className="profile-header__label">Mật khẩu hiện tại</label>
              <Input type="password" />
            </div>
            <div>
              <label className="profile-header__label">Mật khẩu mới</label>
              <Input type="password" />
            </div>
            <div>
              <label className="profile-header__label">
                Nhập lại mật khẩu mới
              </label>
              <Input type="password" />
            </div>
            <div className="profile-header__dialog-actions">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsPassOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
