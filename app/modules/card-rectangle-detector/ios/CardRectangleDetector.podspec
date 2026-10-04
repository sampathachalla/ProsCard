Pod::Spec.new do |s|
  s.name           = 'CardRectangleDetector'
  s.version        = '1.0.0'
  s.summary        = 'Finds a business card in a photo with Apple Vision and straightens it.'
  s.author         = 'MindPros'
  s.homepage       = 'https://mindpros.com'
  s.license        = 'UNLICENSED'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.swift_version  = '5.9'
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'Vision', 'CoreImage', 'AVFoundation'

  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.swift'
end
