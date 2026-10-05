import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Direct Microservices Port Mapping for local development
const PORTS = {
  MASTER: 'http://127.0.0.1:8081',
  INWARD: 'http://127.0.0.1:8082',
  POLICY: 'http://127.0.0.1:8083',
  WORKFLOW: 'http://127.0.0.1:8084',
  MEMBER: 'http://127.0.0.1:8085',
  ECARD: 'http://127.0.0.1:8086'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // Workflow Service (8084)
      '/api/v1/workflow': {
        target: PORTS.WORKFLOW,
        changeOrigin: true
      },
      '/ws': {
        target: PORTS.WORKFLOW,
        ws: true,
        changeOrigin: true
      },

      // Policy Service (8083)
      '/v1/ocr': {
        target: PORTS.POLICY,
        changeOrigin: true
      },
      '/v1/policy-endorsements': {
        target: PORTS.POLICY,
        changeOrigin: true
      },
      '/v1/enroll/policy': {
        target: PORTS.POLICY,
        changeOrigin: true
      },
      '/v1/policies': {
        target: PORTS.POLICY,
        changeOrigin: true
      },

      // Inward Service (8082)
      '/v1/files': {
        target: PORTS.INWARD,
        changeOrigin: true
      },
      '/v1/generateId': {
        target: PORTS.INWARD,
        changeOrigin: true
      },
      '/v1/scan': {
        target: PORTS.INWARD,
        changeOrigin: true
      },
      '/v1/xml-parser': {
        target: PORTS.INWARD,
        changeOrigin: true
      },

      // Member Service (8085)
      '/v1/enrollment': {
        target: PORTS.MEMBER,
        changeOrigin: true
      },
      '/v1/member': {
        target: PORTS.MEMBER,
        changeOrigin: true
      },
      '/v1/members': {
        target: PORTS.MEMBER,
        changeOrigin: true
      },

      // E-Card Service (8086)
      '/v1/ecards': {
        target: PORTS.ECARD,
        changeOrigin: true
      },

      // Master Service (8081)
      '/api/v1/groups': {
        target: PORTS.MASTER,
        changeOrigin: true
      },
      '/api/v1/users': {
        target: PORTS.MASTER,
        changeOrigin: true
      },
      '/v1/corporate': {
        target: PORTS.MASTER,
        changeOrigin: true
      },
      '/v1/corporate-group': {
        target: PORTS.MASTER,
        changeOrigin: true
      },
      '/v1/broker': {
        target: PORTS.MASTER,
        changeOrigin: true
      },
      '/v1/agent': {
        target: PORTS.MASTER,
        changeOrigin: true
      },
      '/v1/insurer': {
        target: PORTS.MASTER,
        changeOrigin: true
      },
      '/v1/insurer-office': {
        target: PORTS.MASTER,
        changeOrigin: true
      },
      '/v1/plantypes': {
        target: PORTS.MASTER,
        changeOrigin: true
      },
      '/v1/documentmaster': {
        target: PORTS.MASTER,
        changeOrigin: true
      }
    }
  }
})
