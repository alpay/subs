# Cursor Rules – Subs

## Amount / Date Picker pattern (gorhom bottom-sheet stack)

**Kural:** Amount picker, date picker gibi “üstte açılan ikinci sheet” ihtiyacını **route ile değil**, **aynı ekranda ikinci/üçüncü `ModalSheet` + state** ile çöz.

### Neden

- Expo Router’da `transparentModal` (ve benzeri) ile nested modal stack kullanırken `router.back()` / `router.dismiss(1)` tek ekran kapatmıyor, tüm modal grubu kapanıyor.
- Bu yüzden “sadece picker’ı kapat, ana sheet açık kalsın” davranışı **router API ile güvenilir şekilde** alınamıyor.
- **Gorhom stack:** Aynı ekranda birden fazla `ModalSheet` render edip `isVisible` ile aç/kapa. Kapanma sadece o sheet’e ait olur; `router.back()` kullanmıyoruz.

### Nasıl yapılır

1. **State:** Picker’ı açan ekranda `showAmountPicker` / `showDatePicker` (veya genel `showXPicker`) gibi boolean state tut.
2. **Açmak:** `router.push` kullanma. Picker satırına tıklanınca `setShowAmountPicker(true)` (veya ilgili setter) çağır.
3. **İkinci/üçüncü ModalSheet:** Aynı ekranın return’ünde ana `ModalSheet`’e ek olarak picker için ayrı `ModalSheet` render et:
   - `isVisible={showAmountPicker}` (veya ilgili state)
   - `onClose={() => setShowAmountPicker(false)}`
   - İçerik: `<AmountPickerContent onDone={() => setShowAmountPicker(false)} />` (veya `DatePickerContent` vb.)
4. **Kapatmak:** Picker içinde “Done” / “Close” sadece `onDone` / `onClose` ile state’i false yapsın; **`router.back()` veya `router.dismissTo` kullanma** (bu ekran route değil, gorhom stack).

### Kullanılacak bileşenler

- **İçerik (UI):** `@/components/amount-picker-content` → `AmountPickerContent`, `AmountPickerCurrencyPill`
- **İçerik (UI):** `@/components/date-picker-content` → `DatePickerContent`
- **Kabuk:** `@/components/modal-sheet` → `ModalSheet` (`isVisible`, `onClose`, `topRightActionBar` vb.)

### Örnek (new-subscription)

```tsx
const [showAmountPicker, setShowAmountPicker] = useState(false);
const [showDatePicker, setShowDatePicker] = useState(false);

const handleAmountPress = useCallback(() => setShowAmountPicker(true), []);
const handleDatePress = useCallback(() => setShowDatePicker(true), []);

return (
  <>
    <ModalSheet title="New Subscription" ...>
      {/* Ana form; Amount/Date satırları handleAmountPress / handleDatePress ile */}
    </ModalSheet>

    <ModalSheet
      title="Amount"
      closeButtonTitle="Close"
      isVisible={showAmountPicker}
      onClose={() => setShowAmountPicker(false)}
      topRightActionBar={<AmountPickerCurrencyPill />}
      enableDynamicSizing
      bottomScrollSpacer={24}
    >
      <AmountPickerContent onDone={() => setShowAmountPicker(false)} />
    </ModalSheet>

    <ModalSheet
      title="Start Date"
      closeButtonTitle="Close"
      isVisible={showDatePicker}
      onClose={() => setShowDatePicker(false)}
      enableDynamicSizing
      bottomScrollSpacer={24}
      scrollViewProps={{ bounces: false }}
    >
      <DatePickerContent onDone={() => setShowDatePicker(false)} />
    </ModalSheet>
  </>
);
```

### Route’taki amount-picker / date-picker ekranları

- Başka yerden **route ile** açılıyorsa (örn. subscription-form) `/(app)/amount-picker` ve `/(app)/date-picker` route’ları kalabilir; orada `dismissTo` param ile `router.dismissTo(dismissTo)` kullan.
- Yeni ekranlarda mümkünse **aynı ekranda ModalSheet + state** pattern’ini tercih et; böylece router’a bağlı kapanma sorunu olmaz.
