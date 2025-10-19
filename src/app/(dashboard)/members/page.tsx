import { MembersView } from "@/components/members-view";

const mockMembers = [
  {
    id: "USR-001",
    name: "สมชาย ใจดี",
    age: "35",
    location: "กรุงเทพมหานคร",
    credits: "15 ชม.",
    skills: "ดูแลผู้สูงอายุ, ทำอาหาร",
    status: "active",
  },
  {
    id: "USR-002",
    name: "สมหญิง รักไทย",
    age: "28",
    location: "เชียงใหม่",
    credits: "30 ชม.",
    skills: "สอนพิเศษ, แปลภาษา",
    status: "active",
  },
  {
    id: "USR-003",
    name: "จอห์น โด",
    age: "42",
    location: "ภูเก็ต",
    credits: "5 ชม.",
    skills: "ดำน้ำ, ถ่ายภาพ",
    status: "inactive",
  },
];

export default function MembersPage() {
  return <MembersView initialMembers={mockMembers} />;
}
