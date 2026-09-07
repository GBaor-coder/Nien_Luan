import React, { useState, useEffect } from 'react';
import { User, Mail, BookOpen, Calendar, Award, Phone, Hash, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { studentService } from '../../services/student.service';
import Card from '../../components/ui/Card';

const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [borrowStats, setBorrowStats] = useState({ total: 0, active: 0, returned: 0 });
  const [loading, setLoading] = useState(true);

  const student = user?.student;
  const teacher = user?.teacher;
  const membershipCard = student?.membershipCard;
  const name = user?.name || 'User';
  const initials = name.split(' ').map(n => n[0]).join('');
  const readerId = user?.id || '';
  const studentId = student?.id || '';
  const teacherId = teacher?.id || '';
  const hasReaderProfile = !!studentId || !!teacherId;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasReaderProfile) {
        setLoading(false);
        return;
      }
      studentService.getMyBorrowings(readerId, { limit: 100, studentId: studentId || undefined, teacherId: teacherId || undefined })
        .then((res) => {
          const records = res.data.data.records;
          setBorrowStats({
            total: records.length,
            active: records.filter(r => r.status === 'active' || r.status === 'overdue').length,
            returned: records.filter(r => r.status === 'returned').length,
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [hasReaderProfile, readerId, studentId, teacherId]);

  const infoItems = [
    { label: 'Họ tên', value: name, icon: User },
    { label: 'Email', value: user?.email || '-', icon: Mail },
    ...(student ? [
      { label: 'Mã sinh viên', value: student.studentId || user?.code || '-', icon: Award },
      { label: 'Lớp', value: student.className || '-', icon: BookOpen },
      { label: 'Năm học', value: student.grade ? `Năm ${student.grade}` : '-', icon: GraduationCap },
      { label: 'Năm nhập học', value: student.enrollYear?.toString() || '-', icon: Calendar },
    ] : teacher ? [
      { label: 'Mã giáo viên', value: teacher.teacherId || user?.code || '-', icon: Award },
      { label: 'Khoa', value: teacher.department || '-', icon: BookOpen },
      { label: 'Chức vụ', value: teacher.position || '-', icon: Briefcase },
      { label: 'Học vị', value: teacher.degree || '-', icon: Calendar },
    ] : []),
    { label: 'Số điện thoại', value: user?.phone || '-', icon: Phone },
    { label: 'Mã thẻ thư viện', value: membershipCard?.cardNumber || '-', icon: Hash },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100">Hồ sơ của tôi</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">Xem thông tin tài khoản thư viện của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-[24px] font-bold">{initials}</span>
            </div>
            <h3 className="text-[18px] font-bold text-slate-900 dark:text-slate-100">{name}</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-1">{student?.studentId || teacher?.teacherId || user?.code}</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">{student?.className || teacher?.department || '-'}</p>
            <div className="flex items-center justify-center gap-4 text-[12px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Thẻ đang hoạt động
              </span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-4">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <Icon size={16} className="text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400 uppercase tracking-wide">{item.label}</p>
                      <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-4">Thống kê mượn sách</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Tổng lần mượn', value: borrowStats.total },
                { label: 'Đang mượn', value: borrowStats.active },
                { label: 'Đã trả', value: borrowStats.returned },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 text-center">
                  <p className="text-[24px] font-bold text-blue-600">{loading ? '-' : stat.value}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {membershipCard && (
            <Card className="p-6">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-4">Thẻ thư viện</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-center">
                  <p className="text-[14px] font-bold text-slate-900 dark:text-slate-100">{membershipCard.maxBorrow}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Sách tối đa</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-center">
                  <p className="text-[14px] font-bold text-slate-900 dark:text-slate-100">{membershipCard.borrowDays} ngày</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">/lần mượn</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-center">
                  <p className="text-[14px] font-bold text-slate-900 dark:text-slate-100">
                    {new Date(membershipCard.expiryDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Hạn thẻ</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-center">
                  <p className="text-[14px] font-bold text-green-600 dark:text-green-400 capitalize">{membershipCard.status}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Trạng thái</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
