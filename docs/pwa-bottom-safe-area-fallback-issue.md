# PWA Bottom Safe Area Issue: Nguyen nhan va giai phap

## Tom tat

Sau khi toi uu perceived performance cho bottom navigation va route fallback, app PWA bi mat phan khong gian sat canh duoi man hinh dien thoai. Bieu hien la giao dien khong con chiem tron vung day nhu truoc, tao cam giac bi ho hoac bi day len khoi canh duoi.

Nguyen nhan khong nam o `BottomNavigationBar` truc tiep, ma nam o cach `RouteLoadingFallback` duoc sua de tao mot PWA shell rieng.

## Nguyen nhan

Thay doi gay loi la viec them mot nhanh rieng cho PWA trong `RouteLoadingFallback`:

```tsx
if (isPWA) {
  return (
    <div
      className={`${fallbackStyles.routeShell} ${fallbackStyles.routeShellPwa}`}
      aria-busy="true"
    >
      <div
        className={`${fallbackStyles.pwaContentSkeleton} ${
          showBottomDock ? fallbackStyles.pwaContentWithBottomDock : ""
        }`}
      >
        {skeletonContent}
      </div>
      {showBottomDock ? <BottomNavigationBar /> : null}
    </div>
  );
}
```

Va CSS di kem:

```scss
.routeShellPwa {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  min-height: 100svh;
  min-height: 100dvh;
  height: 100svh;
  height: 100dvh;
  overflow: hidden;
  padding: 0;
}

.pwaContentSkeleton {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: calc($space-4 + env(safe-area-inset-top, 0px)) $space-4
    calc($space-4 + env(safe-area-inset-bottom, 0px));
}

.pwaContentWithBottomDock {
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
}
```

Nhan xet:

- `RouteLoadingFallback` chi nen la fallback tam thoi cho Suspense/loading.
- Khi fallback tu tao mot fixed PWA shell rieng, no canh tranh voi layout PWA that (`PwaStackScreenLayout`) va bottom navigation fixed.
- `height: 100dvh/100svh`, `overflow: hidden`, va bottom padding rieng lam viec tinh vung day bi khac voi layout that.
- `BottomNavigationBar` duoc render lai ben trong fallback, khien trang thai loading co the co chrome/padding khac voi trang thai da load.
- Tren mobile/PWA, su khac biet nay lam app khong con an sat canh duoi nhu truoc.

## Dau hieu nhan biet

- Loi chi xuat hien sau khi sua route fallback/perceived performance.
- Khi undo nhanh PWA fixed shell trong `RouteLoadingFallback`, app lay lai duoc khong gian phia duoi.
- Viec them/xoa preload route khong lam thay doi truc tiep vung day; nguyen nhan nam o shell/padding/fixed layout cua fallback.

## Giai phap da giu lai

Khong dung PWA shell rieng trong `RouteLoadingFallback`.

Giu fallback don gian nhu cu:

```tsx
return (
  <div className={fallbackStyles.routeShell} aria-busy="true">
    {skeletonContent}
    {showBottomDock ? <div className={fallbackStyles.bottomDock} /> : null}
  </div>
);
```

Va xoa cac class CSS sau:

- `.routeShellPwa`
- `.pwaContentSkeleton`
- `.pwaContentWithBottomDock`

## Nguyen tac cho cac lan sua tiep theo

- Khong tao them fixed PWA shell moi trong fallback neu app da co `PwaStackScreenLayout`.
- Khong render `BottomNavigationBar` that ben trong fallback content neu fallback dang nam trong mot layout da quan ly bottom navigation.
- Neu can skeleton khi route lazy load, skeleton nen chi thay content, khong thay toan bo viewport chrome.
- Neu can chua khoang cho bottom nav, uu tien dung layout co san (`contentWithBottomNavigation`) thay vi tinh padding rieng trong fallback.
- Khi sua cac van de safe area, can test truc tiep tren PWA/mobile vi desktop browser khong phan anh dung `env(safe-area-inset-bottom)`, `100dvh`, va standalone display mode.

## Ket luan

Giai phap dung cho hien tai la giu cac toi uu preload/navigation, nhung khong dung fixed PWA fallback shell. Fallback route nen nhe, tam thoi, va khong duoc thay doi cach app chiem viewport o mobile.
