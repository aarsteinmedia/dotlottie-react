import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

import DotLottiePlayer from '@/index'

const root = document.querySelector('#root')

if (!root) {
  throw new Error('No root element')
}

hydrateRoot(root,
  <StrictMode>
    <div style={{
      margin: '40px auto',
      maxWidth: '800px',
      width: '80%'
    }}>
      <div id="container"
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          gap: '1em',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
        <DotLottiePlayer autoplay controls background="rgba(255,255,255,0.8)" src="" />
      </div>
    </div>
  </StrictMode>)