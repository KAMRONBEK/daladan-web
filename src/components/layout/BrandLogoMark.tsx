import type { CSSProperties } from 'react'
import { BRAND_LOGO_SRC } from '../../constants/brand'

type BrandLogoMarkProps = {
  className?: string
  maskSize?: string
}

export const BrandLogoMark = ({ className = '', maskSize = 'contain' }: BrandLogoMarkProps) => {
  const logoMaskStyle: CSSProperties = {
    WebkitMask: `url(${BRAND_LOGO_SRC}) center / ${maskSize} no-repeat`,
    mask: `url(${BRAND_LOGO_SRC}) center / ${maskSize} no-repeat`,
  }

  return (
    <span aria-hidden="true" className={`inline-block shrink-0 bg-current ${className}`} style={logoMaskStyle} />
  )
}
