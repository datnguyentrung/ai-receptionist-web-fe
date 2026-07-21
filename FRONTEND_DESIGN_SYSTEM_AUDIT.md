# Frontend Design System Audit

Pham vi: React, TypeScript, Vite, SCSS/CSS Modules, desktop web va PWA mobile.

Nguon tham chieu chinh:

- `src/styles/_variables.scss`, `src/styles/_mixins.scss`, `src/styles/theme.css`, `src/index.css`
- `src/app/router/AppRoutes.tsx`, `src/app/navigation/path.ts`
- `src/layouts/MainLayout/*`, `src/layouts/PwaStackScreenLayout/*`, `src/layouts/BaseModalLayout/*`
- `src/components/ui/*`, `src/components/common/*`, `src/components/CheckboxChip/*`
- Cac man hinh dai dien: `Dashboard`, `StudentManagement`, `CoachManagement`, `ClassSchedules`, `AttendanceReports`, `PersonalPage`, `AttendanceCheckin`, `AICheckIn`, `UtilitiesPage`, `NotificationPage`

## 1. Tong Quan Phong Cach Hien Tai

Du an dang theo huong **mobile-first operational dashboard cho vo duong Taekwondo**, voi nhan dien do dam ro va nen lam viec sang, mat do thong tin vua den cao. Desktop thien ve workspace quan tri: sidebar navy co dinh, header trang, noi dung dang card/table/grid. PWA thien ve app-like stack navigation: header do rieng, bottom navigation co safe area, modal chuyen thanh bottom sheet, nhieu interaction tactile bang press feedback.

Ket luan nay dua tren cac bang chung:

- `src/styles/_variables.scss`: token trung tam dat ten theo brand red `#e02020`, brand dark `#1a1a2e`, nen `#f4f6fa`, surface trang, status green/amber/red/blue/violet.
- `src/layouts/MainLayout/MainLayout.module.scss`: layout full viewport bang `100dvh`, scroll nam trong `.content`, padding desktop tang tu `$space-3` len `$space-6`.
- `src/layouts/MainLayout/components/Sidebar/Sidebar.module.scss`: desktop sidebar navy `260px`, collapsed `80px`, active nav do va shadow brand.
- `src/layouts/PwaStackScreenLayout/PwaStackScreenLayout.module.scss`: PWA stack screen `position: fixed`, header gradient do, safe area top/bottom, content scroll rieng.
- `src/layouts/MainLayout/components/BottomNavigationBar/BottomNavigationBar.module.scss`: bottom nav fixed, max width `430px`, safe bottom, 5 item grid, nut check-in noi bat o giua.
- `src/components/ui/modal-layout.module.scss`: modal mobile la bottom sheet, desktop la centered dialog tai breakpoint `md`.
- `src/pages/Dashboard/Dashboard.module.scss`: dashboard dung card trang, border nhe, grid 1/2/4 cot, banner gradient brand.
- `src/pages/StudentManagement/StudentManagement.module.scss`: mobile chuyen table thanh card, filter thanh sheet, touch target 44/48px.
- `src/pages/AICheckIn/AICheckIn.module.scss`: man hinh nghiep vu dac thu, full camera surface tren PWA, khong nen copy cho CRUD screen.

Phong cach khong phai minimal thuan tuy. He thong co nen toi gian de doc du lieu, nhung brand red xuat hien manh o navigation, primary action, selected state, header PWA, badge va scanner. Shadow duoc dung tiet che tren card thuong, manh hon o modal, bottom nav va cac surface dac thu.

## 2. Ban Do UI Architecture

| Thanh phan | File | Pham vi su dung | Desktop/PWA | Muc do nen tai su dung |
| ---------- | ---- | --------------- | ----------- | ---------------------- |
| App shell | `src/app/App.tsx` | Boc `BrowserRouter`, `PullToRefreshProvider`, `Toaster`, error boundary | Ca hai | Bat buoc dung qua app root |
| Route layout selector | `src/app/router/AppRoutes.tsx` | Chon `MainLayout`, `StackRouteLayout`, route protected/public | Ca hai | Bat buoc tai su dung routing pattern hien co |
| Desktop main layout | `src/layouts/MainLayout/MainLayout.tsx` | Layout sidebar, header, scroll content, bottom nav PWA fallback | Chu yeu desktop, co guard PWA | Tai su dung cho workspace desktop |
| Main layout style | `src/layouts/MainLayout/MainLayout.module.scss` | Full viewport, content scroll, safe bottom | Ca hai | Tai su dung quy tac scroll/padding |
| Header desktop | `src/layouts/MainLayout/components/Header/Header.tsx` | Title theo route, date, search, notification dropdown | Desktop, an search tren mobile | Tai su dung cho desktop shell, khong dung lam PWA stack header |
| Sidebar | `src/layouts/MainLayout/components/Sidebar/Sidebar.tsx` | Brand, nav, profile menu, logout confirm | Desktop; mobile drawer non-PWA | Tai su dung cho desktop only |
| Bottom navigation | `src/layouts/MainLayout/components/BottomNavigationBar/BottomNavigationBar.tsx` | 5 tab PWA, preload route, double tap scroll top | PWA | Bat buoc tai su dung cho main PWA tabs |
| PWA stack layout | `src/layouts/PwaStackScreenLayout/PwaStackScreenLayout.tsx` | Header do, back button, optional scan action, scroll content | PWA | Bat buoc cho screen PWA dang route con |
| Pull to refresh | `src/app/providers/pull-to-refresh/PullToRefresh.tsx` | Indicator sticky, refresh context | PWA | Tai su dung cho scroll container PWA |
| Modal primitive | `src/components/ui/modal-layout.tsx` | Portal, body scroll lock, escape/backdrop, drag-down optional | Ca hai | Nen la primitive mac dinh cho modal moi |
| Modal style primitive | `src/components/ui/modal-layout.module.scss` | Mobile bottom sheet, desktop centered modal | Ca hai | Bat buoc dung tru khi modal qua dac thu |
| Base modal wrapper | `src/layouts/BaseModalLayout/BaseModalLayout.tsx` | Header, title, subtitle, footer, close button | Ca hai | Nen dung cho form modal CRUD co header/footer chuan |
| Confirm modal | `src/components/common/ConfirmModal/ConfirmModal.tsx` | Confirm/cancel, loading, toast success/error | Ca hai | Bat buoc cho destructive/confirmation |
| Avatar | `src/components/common/Avatar/Avatar.tsx` | Initials va mau tu ten | Ca hai | Tai su dung, nhung nen chuan hoa size variant |
| Pagination | `src/components/common/Pagination/Pagination.tsx` | Footer pagination cho table | Desktop va mobile | Tai su dung cho table/list co paging |
| Checkbox chip | `src/components/CheckboxChip/CheckboxChip.tsx` | Filter chip co check indicator | Ca hai | Tai su dung cho filter multi-select |
| Mini action popover | `src/components/ui/mini-action-popover.tsx` | Context action menu nho | Desktop/PWA tuy noi dung | Tai su dung cho row/card action |
| Shadcn/Radix button | `src/components/ui/button.tsx` | Primitive button variant Tailwind | It duoc dung trong app chinh | Dung co can nhac, hien chua phai button pattern chinh |
| Shadcn/Radix input | `src/components/ui/input.tsx` | Primitive input Tailwind | Ca hai | Co the dung trong form moi, can map ve token SCSS |
| Shadcn/Radix select | `src/components/ui/select.tsx` | Select trigger/content | Ca hai | Nen dung khi can select accessible |
| Shadcn/Radix tabs | `src/components/ui/tabs.tsx` | Tabs primitive | Personal page tabs | Dung cho tab semantic moi |
| Shadcn/Radix card | `src/components/ui/card.tsx` | Card primitive | Personal report components | Dung neu component con da theo Tailwind, con page SCSS van uu tien module |
| Shadcn/Radix table | `src/components/ui/table.tsx` | Table primitive | Chua phai table pattern chinh | Chua nen thay table SCSS hien tai neu khong refactor |
| Toast helpers | `src/components/ui/toast.ts`, `src/app/App.tsx` | Sonner toaster top-right | Ca hai | Dung cho feedback non-blocking |
| Dashboard page | `src/pages/Dashboard/Dashboard.tsx`, `.module.scss` | Overview cards, charts, table | Desktop chinh, PWA fallback grid 1 cot | Man hinh dai dien desktop dashboard |
| Student management | `src/pages/StudentManagement/StudentManagement.tsx`, `.module.scss` | CRUD, stat cards, filters, table/card mobile, modals | Ca hai | Man hinh mau cho CRUD/list responsive |
| Coach management | `src/pages/CoachManagement/CoachManagement.tsx`, `.module.scss` | Grouped card grid, modal | Ca hai | Mau card grid don gian |
| Class schedules | `src/pages/ClassSchedules/*`, `src/features/classSchedule/components/*` | Schedule grid/week, class cards, create/update modal | Ca hai | Man hinh mau cho domain card/list |
| Attendance reports | `src/pages/AttendanceReports/*`, `src/features/studentAttendance/components/*` | Filters, summary, table/card, confirm delete | Ca hai | Man hinh mau cho report/table |
| Personal page | `src/pages/PersonalPage/*` | Profile header, tabs, student/coach detail | Ca hai, PWA special | Mau cho profile/tab content |
| Attendance check-in | `src/pages/AttendanceCheckin/*` | Session attendance list, bottom bar, student cards | Ca hai | Mau cho workflow tren san tap |
| AI check-in | `src/pages/AICheckIn/*` | Full camera/check-in UI | Dac thu PWA va desktop | Khong copy cho man CRUD thuong |
| Utilities/Notifications | `src/pages/UtilitiesPage/*`, `src/pages/NotificationPage/*` | Utility cards, notification lists/detail | PWA main tabs | Tai su dung list/card + bottom nav spacing |

## 3. Design Tokens Hien Tai

Ket qua thong ke SCSS/CSS/TSX cho thay token SCSS duoc dung nhieu nhat la `$space-3`, `$space-2`, `$space-4`, `$brand-red`, `$text-sm`, `$radius-full`, `$transition-fast`, `$radius-md`, `$bg-white`, `$border-subtle`. Cac hex hay gap nhat la `#ffffff`, `#e02020`, `#111827`, `#9ca3af`, `#e5e7eb`, `#f3f4f6`, `#6b7280`, `#374151`.

| Nhom token | Gia tri pho bien | Noi su dung | De xuat token chuan |
| ---------- | ---------------- | ----------- | ------------------- |
| Brand primary | `$brand-red`, `#e02020`; variants `#f53535`, `#7b0000` | `_variables.scss`, `Sidebar`, `BottomNavigationBar`, `Dashboard`, `StudentManagement`, `PwaStackScreenLayout` | `--color-brand`, `--color-brand-hover`, `--color-brand-dark`; tiep tuc alias SCSS `$brand-red*` |
| Brand dark | `$brand-dark`, `#1a1a2e`, `#0e0e1e` | Sidebar, dark confirm modal, AICheckIn | `--color-chrome-dark`, `--color-chrome-deep` |
| Background page | `$bg-base`, `#f4f6fa`, co ngoai le `#f8fafc`, `#f8f9fa` | MainLayout, PersonalPage, AICheckIn, Utilities | Chuan la `$bg-base`; `#f8fafc` chi dung cho scanner/surface dac thu |
| Surface | `$bg-white`, `$bg-surface`, `#ffffff` | Card, modal, input, table | Chuan hoa ve `$bg-surface` cho card/panel, `$bg-white` cho modal/input |
| Text primary | `$text-primary`, `#111827` | Toan bo page, table, headings | Chuan la `$text-primary` |
| Text secondary | `$text-secondary`, `#374151`, `$text-muted`, `#6b7280`, `$text-subtle`, `#9ca3af` | Table cells, meta, subtitle | Chuan: primary `#111827`, secondary `#374151`, muted `#6b7280`, subtle `#9ca3af` |
| Border | `$border-subtle`, `#f0f0f5`, `$border-default`, `#e5e7eb`, `$gray-100` | Card border, table divider, input | Chuan: `$border-subtle` cho card, `$border-default` cho input/modal, `$gray-100` cho row divider |
| Success | `$success`, `#10b981`, `#059669`, bg `#ecfdf5` | Attendance, stat, capacity, success toast/context | Chuan: `$success`, `$success-50`, `$success-700` |
| Warning | `$warning`, `#f59e0b`, `#fef3c7`, `#92400e` | Status/badge/caution | Chuan: `$warning`, `$warning-100`, `$warning-800` |
| Error/destructive | `$error`, `#ef4444`, `#dc2626`, `#b91c1c`, bg `#fef2f2` | Delete, absent, error | Chuan: `$error`, `$error-50`, `$error-700`; destructive action co the dung `$gradient-brand` neu brand destructive |
| Info | `$info`, `#3b82f6`, `#2563eb` | Excused/info, CheckboxChip checked | Chuan: `$info`, `$info-50`, `$info-700` |
| Typography family | `$font-sans`: `"Inter", "Poppins", system-ui`; `:root` cung Inter/Poppins | Global reset, AICheckIn | Chuan: Inter primary; Poppins chi fallback |
| Typography size | `$text-xs`, `$text-sm`, `$text-base`, `$text-lg`, `$text-xl`, `$text-2xl`; nhieu px `10/11/12/13/14/15` | Tables, badges, page header, inline style Dashboard | Chuan: dung `$text-*`; px chi cho icon labels cuc nho trong nav/badge neu co ly do |
| Font weight | `$font-medium`, `$font-semibold`, `$font-bold`, `$font-extrabold`; 400/500/600/700/800 | Toan bo UI | Chuan: 400 body, 500 label, 600 actions, 700 heading, 800 big metric |
| Line height | `$leading-tight`, `$leading-normal`, `$leading-relaxed` | Header, modal, details | Chuan hoa theo token, tranh fixed `1` tru nut/icon |
| Spacing | `$space-1` den `$space-20`; pho bien `$space-2/3/4/5/6`; magic `10px`, `14px`, `18px`, `22px` | Layout, cards, table, PWA header | Chuan: 4px scale; magic chi cho scanner geometry hoac visual fine-tuning |
| Radius | `$radius-sm` 8, `$radius-md` 12, `$radius-lg` 16, `$radius-xl` 20, `$radius-2xl` 24, `$radius-full`; magic 18/22/28/36 | Cards, filters, bottom sheet, PWA header | Chuan: card 16, compact 12, button 12/full, modal 16 desktop/24 sheet; 28+ chi PWA/scanner dac thu |
| Shadow | `$shadow-xs/sm/md/lg/xl/2xl`, `$shadow-brand` | Modal, bottom nav, sidebar active, cards | Chuan: card `$shadow-xs` hoac border, modal `$shadow-2xl`, dropdown `$shadow-lg/xl` |
| Button/input height | 44/48 touch target, `h-9` trong UI primitive, form custom 40/48 | Header button, modal, filter, input | Chuan: interactive mobile >=44, preferred 48; desktop compact 36/40 duoc neu khong touch critical |
| Icon size | 16/18/20/21/25/28, lucide | Sidebar, bottom nav, header, buttons | Chuan: nav 18-20, action 16-18, PWA back 28, central check-in 25 |
| Breakpoint | `$xs 375`, `$sm 640`, `$md 768`, `$lg 1024`, `$xl 1280`, `$xxl 1536`; raw 360/420/430/575/576/720/767/768/991 | Mixins, component overrides | Chuan: dung mixin; raw chi cho device/legacy cap co comment |
| Z-index | `$z-raised 10`, `$z-dropdown 100`, `$z-sticky 200`, `$z-overlay 300`, `$z-modal 400`, `$z-toast 500`, `$z-tooltip 600`; magic `1000`, `1200`, `1300 !important`, `9999` | Modal, AICheckIn, popover legacy | Chuan: semantic scale; can bo sung token neu can layer ngoai le |
| Transition | `$transition-fast` 0.15s, `$transition-base` 0.2s, `$transition-slow` 0.3s; custom 160/180/220/350ms | Press, hover, modal, sheet | Chuan: 150-220ms cho UI, 300-350ms cho sheet/drawer |

Token chuan da ton tai chu yeu trong `src/styles/_variables.scss`. Van de lon la mot so page con va primitive Tailwind van dung hex/px rieng nen dev moi de copy sai.

## 4. Quy Tac Thiet Ke Dang Ton Tai

### Typography

- He thong mac dinh Inter/Poppins qua `src/index.css` va `$font-sans` trong `src/styles/_variables.scss`.
- Scale chinh la `$text-xs` den `$text-4xl`, dung `clamp()` de fluid tu mobile den desktop.
- Man hinh data dung nhieu `$text-xs`, `$text-sm`; heading page thuong `$text-lg`/`$text-xl`; metric lon `$text-2xl`.
- Inline text size trong `Dashboard.tsx`, `Header.tsx`, `Pagination.tsx` la lech chuan vi hard-code `12px`, `14px`, `#111827`, `#9CA3AF`.

### Color

- Brand red `#e02020` la mau dieu huong/action/selected. Bang chung: `Sidebar.navLinkActive`, `BottomNavigationBar.navItemActive`, `StudentManagement.addBtn`, `Dashboard.banner`.
- Navy `#1a1a2e` dung cho chrome/toi: sidebar, confirm modal, mot so AI surfaces.
- Nen chinh la cool gray `#f4f6fa`, card/modal/input la trang.
- Status colors da co semantic tokens trong `_variables.scss` va duoc lap lai trong attendance, dashboard, badges.
- Gradient do duoc dung cho banner, primary action, PWA header, nhung khong phai background chung moi noi.

### Spacing

- Grid 4px la nen tang. `$space-2/3/4/5/6` la nhom pho bien.
- Desktop content padding tu `MainLayout.content`: mobile `$space-3`, sm `$space-4`, md `$space-6`.
- Page shell thuong `display:flex; flex-direction:column; gap:$space-5`.
- Mobile/PWA giam gap xuong `$space-3/4` va them safe bottom.

### Radius

- Card/panel mac dinh: `$radius-lg` 16px.
- Button/filter/input: `$radius-md` 12px hoac pill.
- Bottom sheet: `$radius-2xl $radius-2xl 0 0`.
- PWA/AI scanner co radius 20-28px vi la surface dac thu, khong nen copy vao CRUD card thuong.

### Shadow

- Card thuong uu tien border nhe `#f0f0f5` hoac `$shadow-xs`, khong qua noi.
- Active/primary action co `$shadow-brand`.
- Dropdown/popover/modal/bottom nav dung shadow manh hon: `$shadow-lg/xl/2xl`.
- Mot so file dung shadow magic nhu `0 18px 40px`, `0 22px 60px`; chap nhan voi bottom nav/scanner, can tranh trong card CRUD moi.

### Layout

- Desktop: `MainLayout` tao chrome: sidebar + header + content scroll. Page con khong nen tu set full viewport tru khi la fullscreen route.
- Desktop card/report dung grid responsive: 1 cot mobile, 2 cot tablet, 3/4 cot desktop.
- Table tren desktop giu dang table, tren mobile hoac scroll ngang hoac chuyen thanh card neu du lieu can doc nhanh.
- `AICheckIn` la fullscreen workflow, co quy tac rieng va bleed khoi padding desktop.

### Navigation

- Desktop navigation la sidebar dark, active item red.
- PWA main navigation la bottom nav 5 item, central check-in la CTA noi bat.
- PWA route con dung stack header co back button. Main tab khong hien back button.
- Bottom nav item active co `aria-current`, preload route va double tap active item de scroll top.

### Form

- Form modal nen dung `ModalLayout` hoac `BaseModalLayout`.
- Input moi nen dung `$text-base` hoac primitive `Input` vi iOS auto zoom voi font nho.
- Filter phuc tap tren mobile hien dang dung sheet/panel, khong nhoi het vao header desktop thu nho.
- Button action mobile can 44/48px touch target va press feedback.

### Feedback State

- Toast dung Sonner qua `Toaster` trong `App.tsx`, helper `showSuccessToast/showErrorToast`.
- Confirm destructive dung `ConfirmModal`, co loading label, disabled confirm, success/error toast.
- Loading state hay dung skeleton shimmer rieng theo tung page; co global `.skeleton` trong `index.css` nhung chua duoc dung nhat quan.
- Empty/error state thuong la card/panel giua, icon muted, retry button red.

### Responsive

- Mixin `respond-to` la mobile-first va co dieu kien `body:not([data-app-mode="pwa"])`, nghia la PWA khong tu nhan desktop breakpoint styles. Day la quy tac rat quan trong.
- `below` dung cho legacy/mobile cap.
- PWA co override rieng qua `:global(body[data-app-mode="pwa"])`.
- Khong chi thu nho desktop: `StudentManagement` mobile chuyen table row thanh card; `PwaStackScreenLayout` thay header; `ModalLayout` thay centered dialog bang bottom sheet.

### PWA

- Dung `100dvh`/`100svh` thay vi chi `100vh`.
- Safe area duoc xu ly trong global `.safe-*`, mixin `safe-top/safe-bottom`, `PwaStackScreenLayout`, `BottomNavigationBar`, `ModalLayout`.
- Scroll container nam trong layout content, khong de body scroll tu do.
- Bottom nav can content padding bottom rieng: `MainLayout.content` va `PwaStackScreenLayout.contentWithBottomNavigation`.
- Pull-to-refresh chi enable khi `isPWA`.

## 5. Nhung Diem Thieu Nhat Quan

| Van de | File lien quan | Muc do | Nguyen nhan | Cach chuan hoa |
| ------ | -------------- | ------ | ----------- | -------------- |
| Co hai he token song song: SCSS `$brand-red` va Tailwind/CSS variables `--primary:#030213` | `src/styles/_variables.scss`, `src/styles/theme.css`, `src/components/ui/button.tsx` | Cao | Primitive `components/ui` giong shadcn chua map ve brand tokens thuc te | Dong bo `theme.css` primary/destructive/background voi token SCSS hoac tao bridge CSS variables tu `_variables.scss` |
| Button pattern bi phan manh | `src/components/ui/button.tsx`, `src/pages/StudentManagement/StudentManagement.module.scss`, `src/pages/CoachManagement/CoachManagement.module.scss`, `src/pages/Dashboard/Dashboard.module.scss` | Cao | Page tu viet `.addBtn`, `.viewAllBtn`, `.retryButton`; primitive `Button` it duoc dung | Tao `ActionButton`/`PageActionButton` SCSS hoac chuan hoa `Button` variant theo brand red, sau do migrate dan |
| Modal co 3 pattern chong nhau | `src/components/ui/modal-layout.*`, `src/layouts/BaseModalLayout/*`, `src/components/common/ConfirmModal/*`, them overlay rieng trong `StudentManagement.module.scss` | Trung binh-cao | Da refactor mot phan nhung con legacy overlay/modal container | Quy uoc: modal moi dung `BaseModalLayout`; confirm dung `ConfirmModal`; khong tao overlay fixed moi tru khi documented |
| Z-index magic va vuot scale | `src/layouts/BaseModalLayout/BaseModalLayout.module.scss` (`1200`), `src/components/ui/popover.tsx` (`z-[1300]`), `AttendanceTableModal.scss` (`1300 !important`), `AICheckIn.module.scss` (`1000`) | Cao | Can dua modal/popover len tren nhung chua co token scale du | Mo rong `$z-*` hoac doi sang token semantic; loai `!important` khi co the |
| Inline style lap lai mau va typography | `src/pages/Dashboard/Dashboard.tsx`, `src/layouts/MainLayout/components/Header/Header.tsx`, `src/components/common/Pagination/Pagination.tsx`, `src/components/common/Avatar/Avatar.tsx` | Trung binh | Du lieu dong va code cu copy nhanh | Dung CSS custom properties khi can dynamic; con lai dua vao class/token |
| Card radius/shadow khong dong nhat | `Dashboard.module.scss` 16px, `StudentManagement.module.scss` 16/20/22px, `PwaStackScreenLayout.module.scss` 36px variable, `AICheckIn.module.scss` 24/28px | Trung binh | Mot so screen PWA duoc visual tune rieng | Card CRUD chuan 16px desktop, 16-20px mobile; 22px+ chi bottom sheet/scanner/special |
| Media query raw rai rac | `Dashboard.module.scss`, `CoachManagement.module.scss`, `StudentManagement.module.scss`, `AICheckIn.module.scss`, nhieu feature scss | Trung binh | Migration tu CSS cu, can device cap dac thu | Moi file moi dung `@include respond-to/below`; raw chi cho threshold dac thu co comment |
| Table pattern chua co primitive chung | `Dashboard.module.scss`, `StudentManagement.module.scss`, `AttendanceTable.module.scss`, `CoachTimesheetTable.tsx` | Trung binh | Moi domain co data shape khac | Tao guideline `DataTable desktop + CardList mobile`; dung `Pagination` chung; khong ep dung `components/ui/table` neu chua map style |
| Skeleton shimmer bi lap lai | `Dashboard.module.scss`, `StudentManagement.module.scss`, `CoachManagement.module.scss`, `AttendanceReports.module.scss`, `index.css` | Thap-trung binh | Moi page tu viet skeleton theo layout | Tao mixin/class skeleton chung, giu skeleton geometry component-specific |
| PWA bottom spacing co nhieu magic offset | `MainLayout.module.scss`, `PwaStackScreenLayout.module.scss`, `AttendanceCheckin.module.scss`, `AICheckIn.module.scss`, `UtilitiesPage.module.scss` | Cao | Bottom nav, bottom bar va full screen route co chieu cao khac nhau | Chuan hoa CSS vars: `--app-bottom-nav-height`, `--app-bottom-bar-height`, `--app-safe-bottom` |
| `100vh` van ton tai trong legacy modal/page | `BaseModalLayout.module.scss`, `StudentManagement.module.scss`, `ModalDetailExam.scss`, mot so error/welcome page | Trung binh | Desktop-first legacy hoac fallback | Tren PWA/mobile dung `100dvh`; neu can fallback dat `100vh` truoc `100dvh` |
| `respond-to` loai tru PWA co the gay bat ngo | `src/styles/_mixins.scss`, cac SCSS module | Trung binh | Chu dich giu PWA behavior rieng, nhung dev moi de khong biet | Ghi ro trong docs: desktop breakpoint khong ap dung cho PWA; PWA override phai viet rieng |
| Cac file `.scss` global BEM con ton tai | `PersonalPage/components/*/*.scss`, `ExaminationManagement/*.scss`, mot so modal coach | Trung binh | Migration chua xong sang CSS Modules | File moi uu tien `.module.scss`; global SCSS chi legacy hoac integration bat buoc |
| `Avatar` yeu cau width/height/fontSize bang prop string | `src/components/common/Avatar/Avatar.tsx` | Thap | Linh hoat nhung khong co variant | Them variant `sm/md/lg` sau nay; van cho style dynamic khi can |
| `Pagination` active state hard-code inline | `src/components/common/Pagination/Pagination.tsx` | Thap | Active style phu thuoc current page | Dung class `.btnActive` thay inline background/color |
| AICheckIn co override chong lop va duplicate display-mode block | `src/pages/AICheckIn/AICheckIn.module.scss` | Trung binh | Man hinh dac thu duoc tune qua nhieu vong | Xem la exception co chu dich; chi refactor khi cham scanner |
| Co comment/encoding hien thi loi trong nhieu file | Nhieu TSX/SCSS co chuoi Vietnamese bi mojibake trong output shell | Thap-trung binh | Encoding hoac terminal display | Can xac minh encoding truoc khi sua text UI; khong tu dong sua trong audit |

## 6. Bo Quy Chuan Xay Dung Giao Dien Moi

### Checklist truoc khi bat dau

- Xac dinh route moi la desktop workspace, PWA main tab, PWA stack screen, hay fullscreen workflow.
- Neu route la CRUD/list/report, mac dinh dung `MainLayout` tren desktop va `PwaStackScreenLayout` tren PWA qua `StackRouteLayout`.
- Kiem tra component da co: `ModalLayout`, `BaseModalLayout`, `ConfirmModal`, `Pagination`, `Avatar`, `CheckboxChip`, `MiniActionPopover`, `PullToRefresh`.
- Dung token trong `src/styles/_variables.scss`; khong hard-code hex/px neu gia tri da co token.
- Chon data presentation: desktop table/grid; mobile card list hoac horizontal scroll tuy data density.
- Tinh safe area va bottom navigation ngay tu dau neu PWA.

### Checklist khi hoan thanh

- Khong co text/interactive overlap o 320px, 375px, 430px, 768px, 1024px.
- PWA khong bi bottom nav che noi dung; content co padding bottom tinh `env(safe-area-inset-bottom)`.
- Form input tren mobile co font-size toi thieu `$text-base` neu la native input/select/textarea.
- Button/action chinh dat min touch target 44/48px va co active/disabled/focus state.
- Modal tren mobile la bottom sheet hoac screen con, khong la desktop dialog thu nho.
- Neu co animation, them `@media (prefers-reduced-motion: reduce)`.
- Khong tao z-index so moi neu co the dung `$z-*`.
- Khong copy style scanner/AICheckIn cho CRUD/report thong thuong.
- UI string va aria-label bang tieng Viet.

### Layout desktop

- Page wrapper: `display:flex; flex-direction:column; gap:$space-5`.
- Khong tu set `height:100vh` trong page con nam duoi `MainLayout`, tru khi route fullscreen.
- Noi dung da duoc `MainLayout.content` padding `$space-6` tu `md` tro len. Page con chi them gap/section, khong them outer padding lon trung lap.
- Section/card:
  - Card nen `background:$bg-surface`, `border:1px solid $border-subtle`, `border-radius:$radius-lg`.
  - Padding card thong thuong `$space-4` den `$space-6`.
  - Dashboard/report co the dung grid `repeat(2/3/4, minmax(0,1fr))` tuy loai du lieu.
- Dung grid khi cac item dong dang: stat cards, class cards, coach cards.
- Dung flex khi header/action/filter co noi dung co gian.
- Dung table khi can so sanh nhieu cot tren desktop; boc bang `overflow-x:auto`.
- Modal desktop: dung `BaseModalLayout` hoac `ModalLayout`, maxWidth theo size `480/640/960`, content scroll trong body.

### Layout PWA

- Route con nen di qua `PwaStackScreenLayout`:
  - Header do co safe top.
  - Back button 48px o trai neu khong phai main tab.
  - Action button phai o phai, dung icon lucide.
  - Content scroll rieng trong `.content`.
- Main tab PWA hien `BottomNavigationBar`; route con khong hien bottom nav tru khi la main screen/profile current user.
- Khong de body scroll lam scroll container chinh. Dung ref scroll container cho `PullToRefresh`.
- Dung `100dvh` hoac stack layout co san; khong chi dung `100vh` cho mobile.
- Padding bottom:
  - Co bottom nav: them padding bottom theo `contentWithBottomNavigation` hoac offset tu layout.
  - Co bottom bar rieng: khai bao CSS var height rieng, cong `env(safe-area-inset-bottom)`.
- Form dai tren PWA:
  - Neu la form phuc tap: uu tien route con/stack screen hoac bottom sheet full width.
  - Neu la confirm ngan: `ConfirmModal`.
  - Neu la picker/filter: bottom sheet voi handle.
- Pull-to-refresh chi enable cho PWA va khi scroll container o top.

### Component rules

- Primary button: hanh dong chinh tao/sua/luu/xac nhan. Dung brand red/gradient brand, text trang, shadow brand nhe, min 44/48px.
- Secondary button: hanh dong phu, border/subtle surface, text secondary/primary.
- Destructive button: xoa/huy co tac dong du lieu. Dung error tokens hoac confirm modal; khong chi doi mau text.
- Icon button: search, notification, more, close, back. Phai co `aria-label`, 44/48px touch target tren mobile.
- Card: thong tin lap lai hoac panel doc lap. Card khong long card neu chi de tao section.
- List item: mobile thay the row table khi cot qua nhieu hoac thao tac can cham nhanh.
- Tabs: dung `components/ui/tabs` hoac pattern tab cua `PersonalPage`, phai horizontal scroll neu qua dai.
- Form field: label + input/select/textarea, focus ring/border ro, error text gan field.
- Modal: `ModalLayout`/`BaseModalLayout`; custom overlay chi khi co workflow dac thu duoc documented.
- Drawer/bottom sheet: mobile filter, picker, form ngan; desktop co the la centered modal.
- Toast: success/error/info cho feedback non-blocking; khong dung toast thay confirm.
- Empty state: icon muted, title ngan, mo ta ro, CTA neu co next step.
- Skeleton/loading: dung shimmer token chung; geometry theo man hinh.

### Responsive rules

- Chi doi kich thuoc: typography, padding, gap, icon size, card padding.
- Doi bo cuc: grid stat/card, filter row, page header action, table wrap.
- Doi interaction hoan toan:
  - Modal desktop -> bottom sheet PWA.
  - Sidebar desktop -> bottom nav/stack header PWA.
  - Table desktop -> card list mobile khi du lieu can thao tac.
  - Full check-in workflow -> PWA fullscreen/camera-specific UI.
- Khong thu nho desktop dashboard thanh mobile neu PWA route da co stack/navigation pattern rieng.

## 7. Mau Cau Truc Man Hinh Moi

### Mau desktop tieu chuan

Component/layout nen dung: route duoi `MainLayout`, page SCSS module, `BaseModalLayout` cho form, `ConfirmModal` cho destructive, `Pagination` neu co paging.

JSX du kien:

```tsx
import { Plus, Search } from "lucide-react";
import { BaseModalLayout } from "@/layouts/BaseModalLayout";
import ConfirmModal from "@/components/common/ConfirmModal";
import { Pagination } from "@/components/common/Pagination";
import styles from "./ExampleManagement.module.scss";

export function ExampleManagement() {
  return (
    <section className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Tieu de man hinh</h1>
          <p className={styles.pageSubtitle}>Mo ta ngan bang tieng Viet</p>
        </div>
        <button type="button" className={styles.primaryAction}>
          <Plus size={16} />
          Them moi
        </button>
      </header>

      <div className={styles.filterBar}>
        <label className={styles.searchBox}>
          <Search size={16} aria-hidden="true" />
          <input placeholder="Tim kiem..." />
        </label>
      </div>

      <section className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>{/* rows */}</table>
        </div>
        <Pagination
          currentPage={1}
          totalPages={5}
          currentListLength={10}
          onPageChange={() => {}}
        />
      </section>

      <BaseModalLayout open={false} onClose={() => {}} title="Them moi">
        {/* form fields */}
      </BaseModalLayout>

      <ConfirmModal
        open={false}
        title="Xac nhan thao tac"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    </section>
  );
}
```

SCSS Module du kien:

```scss
.page {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.pageHead {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
}

.pageTitle {
  margin: 0;
  color: $text-primary;
  font-size: $text-xl;
  font-weight: $font-bold;
  line-height: $leading-tight;
}

.pageSubtitle {
  margin: $space-1 0 0;
  color: $text-subtle;
  font-size: $text-sm;
}

.primaryAction {
  @include touch-target(48px);
  @include press-effect;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  border: 0;
  border-radius: $radius-md;
  background: $gradient-brand;
  color: $white;
  font-size: $text-sm;
  font-weight: $font-semibold;
  box-shadow: $shadow-brand;
}

.filterBar {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
}

.searchBox {
  @include touch-target(48px);
  display: flex;
  align-items: center;
  gap: $space-2;
  min-width: min(100%, 320px);
  padding: $space-2 $space-3;
  border: 1px solid $border-subtle;
  border-radius: $radius-md;
  background: $bg-surface;

  input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: $text-primary;
    font-size: $text-base;
  }
}

.tableCard {
  overflow: hidden;
  border: 1px solid $border-subtle;
  border-radius: $radius-lg;
  background: $bg-surface;
}

.tableWrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

@media (max-width: 575px) {
  .page {
    gap: $space-3;
  }

  .primaryAction {
    width: 100%;
  }
}
```

### Mau PWA tieu chuan

Component/layout nen dung: route duoi `StackRouteLayout` de tu boc `PwaStackScreenLayout`; page con khong tao header rieng neu khong fullscreen. Neu man hinh nam trong main tab, set `withBottomNavigation` qua route logic.

JSX du kien:

```tsx
import { Filter, Plus } from "lucide-react";
import { ModalLayout } from "@/components/ui/modal-layout";
import styles from "./ExamplePwaScreen.module.scss";

export function ExamplePwaScreen() {
  return (
    <section className={styles.page}>
      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span>Dang hoat dong</span>
          <strong>24</strong>
        </article>
      </div>

      <div className={styles.actionRow}>
        <button type="button" className={styles.filterButton}>
          <Filter size={16} />
          Loc
        </button>
        <button type="button" className={styles.primaryButton}>
          <Plus size={16} />
          Them
        </button>
      </div>

      <div className={styles.list}>
        <article className={styles.listItem}>{/* mobile-friendly content */}</article>
      </div>

      <ModalLayout
        open={false}
        onClose={() => {}}
        title="Bo loc"
        closeOnDragDown
      >
        {/* filter controls */}
      </ModalLayout>
    </section>
  );
}
```

SCSS Module du kien:

```scss
.page {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  min-width: 0;
  padding-bottom: calc($space-4 + env(safe-area-inset-bottom, 0px));
}

.summaryGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $space-2;
}

.summaryCard {
  min-width: 0;
  padding: $space-3;
  border: 1px solid $border-subtle;
  border-radius: $radius-lg;
  background:
    linear-gradient(180deg, rgba($white, 0.98), rgba($gray-50, 0.84)),
    $bg-surface;

  span {
    display: block;
    color: $text-muted;
    font-size: $text-xs;
    font-weight: $font-semibold;
  }

  strong {
    display: block;
    margin-top: $space-1;
    color: $text-primary;
    font-size: $text-2xl;
    font-weight: $font-extrabold;
    line-height: 1;
  }
}

.actionRow {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: $space-2;
}

.filterButton,
.primaryButton {
  @include touch-target(48px);
  @include press-effect;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  border-radius: $radius-full;
  font-size: $text-sm;
  font-weight: $font-semibold;
}

.filterButton {
  border: 1px solid $border-subtle;
  background: $bg-surface;
  color: $text-secondary;
}

.primaryButton {
  border: 0;
  padding: 0 $space-4;
  background: $brand-red;
  color: $white;
  box-shadow: 0 10px 22px rgba($brand-red, 0.2);
}

.list {
  display: grid;
  gap: $space-3;
}

.listItem {
  padding: $space-4;
  border: 1px solid rgba($brand-red, 0.08);
  border-radius: $radius-lg;
  background: $bg-surface;
  box-shadow: $shadow-xs;
}

@media (min-width: 0) {
  :global(body[data-app-mode="pwa"]) {
    .page {
      padding-bottom: calc($space-5 + env(safe-area-inset-bottom, 0px));
    }
  }
}
```

Neu PWA screen co bottom navigation, khong tu cong 80/100px tuy tien trong page neu `PwaStackScreenLayout.contentWithBottomNavigation` da xu ly. Chi them offset rieng khi co fixed bottom bar nghiep vu trong page.

## 8. Ke Hoach Chuan Hoa Theo Muc Do Uu Tien

### Viec co the lam ngay, it rui ro

- Tao/bo sung docs ngan trong `src/styles/_variables.scss` ve token nao la chuan cho card, button, form, PWA.
- Doi inline style don gian trong `Pagination.tsx` thanh `.btnActive`.
- Tao class/mixin skeleton shimmer dung chung, giu geometry rieng theo component.
- Them comment trong `_mixins.scss` canh bao `respond-to` khong apply cho `body[data-app-mode="pwa"]`.
- Ghi lai quy tac: file moi dung `.module.scss`, global `.scss` chi legacy.
- Chuan hoa cac page moi dung `$space-*`, `$text-*`, `$radius-*`, `$border-*` thay hex/px.

### Viec nen lam trong ngan han

- Dong bo `src/styles/theme.css` voi brand SCSS: `--primary` nen map ve brand red hoac tao token bridge ro rang de `components/ui/button`, `badge`, `input`, `select` khong di nguoc brand.
- Tao `PageHeader`, `PrimaryActionButton`, `FilterBar` hoac it nhat SCSS pattern reusable cho CRUD/list screen.
- Chuan hoa modal: route moi dung `BaseModalLayout`; migrate cac overlay rieng trong `StudentManagement`, `BaseModalLayout` magic z-index ve `ModalLayout`.
- Tao CSS variables chung cho PWA bottom offsets: `--app-bottom-nav-height`, `--app-safe-bottom`, `--app-bottom-bar-height`.
- Tao `DataTable` guideline/component nhe gom wrapper scroll, header style, row hover, empty state va `Pagination`.
- Them variant cho `Avatar`: `xs/sm/md/lg` de giam inline size strings.

### Viec chi nen lam khi refactor lon

- Migrate cac `.scss` global legacy trong `PersonalPage`, `ExaminationManagement`, coach modals sang CSS Modules.
- Hop nhat Tailwind primitive va SCSS token thanh mot source of truth day du. Khong nen thay UI framework.
- Refactor `AICheckIn.module.scss` thanh cac sub-module nho hon neu tiep tuc phat trien scanner. Day la man hinh dac thu, can regression test bang screenshot/mobile.
- Xay component-level design system package noi bo cho Button/Input/Select/Card/Table, sau khi da audit usage va co migration plan theo page.
- Thiet lap visual regression cho desktop/PWA breakpoints quan trong: 320, 375, 430, 768, 1024, 1280.

