import type { Icon } from '@/features/icons/types'

/** Simplified Africa silhouette (game-icons/africa, CC BY 3.0). */
export const AfricaIcon: Icon = ({ className, ...props }) => (
  <svg
    aria-hidden
    className={className ?? 'size-5 shrink-0 block'}
    fill="currentColor"
    viewBox="35 15 430 445"
    {...props}
  >
    <path d="m201.56 19.495-87.79 9.131-73.745 94.814v52.676l56.186 61.805 64.615-13.344 49.164 9.832-10.535 37.926 33.711 61.103-16.855 42.842 39.79 116.225 53.62-8.768 49.164-55.484 4.213-38.629 31.605-23.879-6.322-69.531 83.594-106.994-51.989 7.263-79.363-138.359-125.016-8.428zm252.346 319.8-14.402 20.86-13.408.496c-11.849 24.321-12.598 38.019-13.907 66.547l17.383 4.471 21.852-52.147z" />
  </svg>
)
