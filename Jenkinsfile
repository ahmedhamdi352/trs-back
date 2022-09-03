def COLOR_MAP = ['SUCCESS': 'good', 'FAILURE': 'danger', 'UNSTABLE': 'danger', 'ABORTED': 'danger']
def BACKEND_SERVER_IP = "192.168.26.211"

pipeline {
  agent any
    
  tools {nodejs "NodeJS"}
    
  stages {
    stage('Prepare environment'){
      steps {
        git branch: 'dev', credentialsId: '5bc18525-2edd-46ac-b937-b289ae7972e3', url: 'http://192.168.14.31/barqsystems/e-invoicing/e-invoicingbe.git'
        dir("${env.WORKSPACE}/server"){
            sh 'npm cache verify'
            sh 'npm ci --keep'
            sh 'mv -f ".env.example" ".env"'
        }
      }
    }

    stage('Build'){
      steps{
        dir("${env.WORKSPACE}/server"){
            sh 'npm run build'
        }
      }
    }

    stage('Obfuscate'){
      steps{
        dir("${env.WORKSPACE}/server"){
            sh 'npm run obfuscate'
            sh 'cp -r dist/* build/'
        }
      }
    }

    stage('Deploy'){
      steps{
        dir("${env.WORKSPACE}/server"){
            sh 'cp -r src/public build/'
            sh "scp -r build node_modules root@${BACKEND_SERVER_IP}:/var/www/html/einvoice/server/"
        }
        sh "ssh root@${BACKEND_SERVER_IP} pm2 restart all"
      }
    }
  }
}
