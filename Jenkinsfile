pipeline {
  agent any
  environment {
    IMAGE = "YOUR_DOCKERHUB_USER/nexuscloud-demo-app"
    TAG   = "${env.BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Test')     { steps { sh 'npm test' } }
    stage('Build Image') { steps { sh 'docker build -t $IMAGE:$TAG -t $IMAGE:latest .' } }
    stage('Push Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'U', passwordVariable: 'P')]) {
          sh 'echo $P | docker login -u $U --password-stdin && docker push $IMAGE:$TAG && docker push $IMAGE:latest'
        }
      }
    }
    stage('Deploy to Kubernetes') {
      steps {
        sh 'sed -i "s|IMAGE_PLACEHOLDER|$IMAGE:$TAG|g" k8s/deployment.yaml'
        sh 'kubectl apply -f k8s/'
        sh 'kubectl rollout status deployment/nexuscloud-demo-app'
      }
    }
  }
}
