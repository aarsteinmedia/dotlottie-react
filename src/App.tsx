// import { getAnimationData } from '@aarsteinmedia/lottie-web/dotlottie'
import files from '@src/files'
import { useState } from 'react'

import { RendererType } from '@/enums'
import DotLottiePlayer from '@/full'

function App() {
  const [state, setState] = useState({
    aspectRatio: '1',
    asset: localStorage.getItem('asset') ?? 'am.lottie',
    renderer: localStorage.getItem('renderer') ?? RendererType.SVG
  })

  // useEffect(() => {
  //   void (async () => {
  //     const { animations = [] } = await getAnimationData(`/assets/${state.asset}`)

  //     setState(prev => ({
  //       ...prev,
  //       aspectRatio: `${(animations[0]?.w ?? 1) / (animations[0]?.h ?? 1)}`
  //     }))
  //   })()
  // }, [state.asset])

  return (
    <>
      <header>
        <div className="header-inner">
          <h1 style={{ margin: '0' }}>dotlottie-react</h1>
          <form id="preview">
            <label>
              Choose renderer:<br />
              <select
                name="renderer"
                value={state.renderer}
                onChange={({ target: { value } }) => {
                  setState(prev => ({
                    ...prev,
                    renderer: value
                  }))
                  localStorage.setItem('renderer', value)
                }}
              >
                <option value={RendererType.SVG}>SVG</option>
                <option value={RendererType.Canvas}>Canvas</option>
              </select>
            </label>
            <label>
              Select file to preview:<br />
              <select
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                name="path"
                value={state.asset}
                onChange={({ target: { value } }) => {
                  setState(prev => ({
                    ...prev,
                    asset: value
                  }))
                  localStorage.setItem('asset', value)
                }}
              >
                <option disabled value="/assets/am.lottie">Path to file</option>
                {files.map(file =>
                  <option key={file} value={file}>{file}</option>)}
              </select>
            </label>
          </form>
        </div>
      </header>
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
          <DotLottiePlayer
            autoplay
            loop
            subframe
            controls
            renderer={state.renderer as RendererType}
            className="preview"
            src={`/assets/${state.asset}`}
            background="rgba(255,255,255,0.8)"
            // style={{ aspectRatio: state.aspectRatio }}
          />
        </div>
      </div>
    </>
  )
}

export default App
