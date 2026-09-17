// import { getAnimationData } from '@aarsteinmedia/lottie-web/dotlottie'
import files from '@src/files'
import { useState } from 'react'

import { RendererType } from '@/enums'
import DotLottiePlayer from '@/full'

export default function App() {
  const [state, setState] = useState({
    aspectRatio: '1',
    asset: localStorage.getItem('asset') ?? 'am.lottie',
    attributes: localStorage.getItem('attributes') ?? 'autoplay',
    renderer: localStorage.getItem('renderer') ?? RendererType.SVG
  })

  return (
    <>
      <header>
        <div className="header-inner">
          <h1 style={{ margin: '0' }}>dotlottie-react</h1>
          <form id="preview">
            <label>
              Attributes:<br />
              <select
                name="attributes"
                value={state.attributes}
                onChange={({ target: { value } }) => {
                  setState(prev => ({
                    ...prev,
                    attributes: value
                  }))
                  localStorage.setItem('attributes', value)
                }}
              >
                <option value="animateOnScroll">Animate on scroll</option>
                <option value="autoplay">Autoplay</option>
                <option value="playOnClick">Play on click</option>
                <option value="playOnVisible">Play on visible</option>
                <option value="hover">Play on hover</option>
              </select>
            </label>
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
            flexDirection: 'column',
            gap: '1em',
            justifyContent: 'center',
          }}>
          <div className="lorem-ipsum" hidden={state.attributes !== 'animateOnScroll'}>
            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
          </div>
          <DotLottiePlayer
            autoplay={state.attributes === 'autoplay'}
            animateOnScroll={state.attributes === 'animateOnScroll'}
            loop
            subframe
            controls
            renderer={state.renderer as RendererType}
            className="preview"
            src={`/assets/${state.asset}`}
            background="rgba(255,255,255,0.8)"
            // style={{ aspectRatio: state.aspectRatio }}
          />
          <div className="lorem-ipsum" hidden={state.attributes !== 'animateOnScroll'}>
            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>

            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>

            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>

            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>

            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>

            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>

            <div style={{ marginBottom: '200vh' }}></div>

            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>

            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>

            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
              placerat. In
              id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
              fringilla lacus
              nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
              class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
