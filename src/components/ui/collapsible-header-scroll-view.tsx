/**
 * CollapsibleHeaderScrollView
 *
 * Aşağı kaydırınca üstteki "collapsible" kısım yukarı gider (gizlenir),
 * "sticky" kısım üstte kalır. Yukarı kaydırınca collapsible tekrar görünür.
 *
 * - collapsibleContent: Scroll ile yukarı kayıp gizlenecek içerik (örn. selam + tarih)
 * - stickyContent: Her zaman üstte kalacak içerik (örn. hafta strip)
 * - children: ScrollView içinde kaydırılacak ana içerik
 */

import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

import { ScrollView, View } from 'react-native';

type Props = ScrollViewProps & {
  collapsibleContent: React.ReactNode;
  stickyContent: React.ReactNode;
  children: React.ReactNode;
  /** Collapsible yüksekliği ölçülmeden önce kullanılacak varsayılan değer (px) */
  defaultCollapsibleHeight?: number;
  /** Collapsible wrapper'a verilecek style (örn. arka plan) */
  collapsibleWrapperStyle?: StyleProp<ViewStyle>;
  /** Sticky wrapper'a verilecek style */
  stickyWrapperStyle?: StyleProp<ViewStyle>;
  /** Children wrapper'a verilecek style (örn. arka plan rengi, alt boşluk doldurmak için) */
  childrenWrapperStyle?: StyleProp<ViewStyle>;
};

export function CollapsibleHeaderScrollView({
  collapsibleContent,
  stickyContent,
  children,
  collapsibleWrapperStyle,
  stickyWrapperStyle,
  childrenWrapperStyle,
  contentContainerStyle,
  ...scrollViewProps
}: Props) {
  return (
    <ScrollView
      {...scrollViewProps}
      stickyHeaderIndices={[1]}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={scrollViewProps.showsVerticalScrollIndicator ?? false}
    >
      {/* Index 0: Collapsible - scroll ile yukarı gider */}
      <View style={collapsibleWrapperStyle}>
        {collapsibleContent}
      </View>

      {/* Index 1: Sticky - üstte sabit kalır */}
      <View style={stickyWrapperStyle}>
        {stickyContent}
      </View>

      {/* Ana içerik - wrapper ile sarılarak arka plan rengi alt kısma kadar uzatılabilir */}
      <View style={childrenWrapperStyle}>
        {children}
      </View>
    </ScrollView>
  );
}
