import { Link } from 'react-router-dom'
import { adStatsCopy } from '../model/adStatsCopy'

type ProfileAdStatsActionLinksProps = {
  adIdStr: string
}

export function ProfileAdStatsActionLinks({ adIdStr }: ProfileAdStatsActionLinksProps) {
  return (
    <Link
      to={`/ad-boost/${adIdStr}?plan=boosted`}
      className="inline-flex shrink-0 items-center justify-center rounded-ui bg-daladan-primary px-4 py-2 text-center text-sm font-semibold text-white hover:brightness-105"
    >
      {adStatsCopy.promotionsCta}
    </Link>
  )
}
