Pod::Spec.new do |s|
  s.name           = 'WalletPassPresenter'
  s.version        = '1.0.0'
  s.summary        = 'Presents signed Apple Wallet passes without opening a browser.'
  s.author         = 'MindPros'
  s.homepage       = 'https://mindpros.com'
  s.license        = 'UNLICENSED'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.swift_version  = '5.9'
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'PassKit'

  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.swift'
end
