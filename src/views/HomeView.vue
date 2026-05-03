<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav
      class="bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-14 sm:h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <div class="flex items-center space-x-1 sm:space-x-2">
              <div class="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-violet-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm sm:text-lg">A</span>
              </div>
              <span class="text-lg sm:text-xl font-bold text-gray-900">AniHan</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#products" class="text-gray-700 hover:text-violet-600 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200">
              Products
            </a>
            <a href="#how-it-works" class="text-gray-700 hover:text-violet-600 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200">
              How it works
            </a>
            <a href="#features" class="text-gray-700 hover:text-violet-600 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200">
              Features
            </a>
            <a href="#about" class="text-gray-700 hover:text-emerald-600 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200">
              About
            </a>
            <a href="#contact" class="text-gray-700 hover:text-diamond-600 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200">
              Contact
            </a>
          </div>

          <!-- Auth / dashboard -->
          <div class="flex items-center space-x-2 sm:space-x-4">
            <template v-if="authStore.isAuthenticated">
              <router-link
                :to="dashboardPath"
                class="text-slate-900 hover:text-violet-600 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-semibold"
              >
                Dashboard
              </router-link>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="text-slate-900 hover:text-violet-600 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-semibold"
              >
                Sign In
              </router-link>
              <router-link
                to="/register?role=user"
                class="btn-primary bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
              >
                Get Started
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="relative bg-gradient-to-r from-violet-600 via-emerald-600 to-diamond-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div class="text-center">
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            AniHan: A Digital Platform for Repurposing
            <span class="block text-emerald-200 mt-2">Agricultural Food Waste in Butuan City</span>
          </h1>
          <p class="text-sm sm:text-base lg:text-xl text-emerald-100 mb-6 sm:mb-8 max-w-4xl mx-auto px-4">
            A comprehensive digital system that enables vendors to manage and reduce food waste by converting surplus or damaged agricultural produce into valuable products such as compost fertilizers and sustainable food items.
          </p>
          <div v-if="!authStore.isAuthenticated" class="flex flex-col items-stretch sm:items-center gap-4 px-4 max-w-2xl mx-auto">
            <p class="text-sm text-emerald-100/95">
              Choose how you want to participate—supply repurposed goods as a vendor, or shop the catalog as a buyer.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
              <router-link to="/register?role=vendor" class="btn-cta-gradient-vendor w-full sm:w-auto">
                Register as vendor
              </router-link>
              <router-link to="/register?role=user" class="btn-cta-gradient-user w-full sm:w-auto">
                Register as user
              </router-link>
            </div>
            <a href="#products" class="btn-cta-gradient-browse w-full sm:w-auto max-w-md">
              Browse products
            </a>
          </div>
          <div v-else class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <router-link :to="dashboardPath" class="btn-cta-gradient-dashboard">
              Go to dashboard
            </router-link>
            <a href="#products" class="btn-cta-gradient-browse">
              Browse products
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Vendor vs buyer: who does what (guest-focused) -->
    <section id="how-it-works" class="py-12 sm:py-16 lg:py-20 bg-slate-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          <p class="text-base sm:text-lg text-gray-600">
            AniHan connects <strong class="text-gray-800">vendors</strong> who turn surplus produce into products with
            <strong class="text-gray-800">buyers</strong> who want affordable compost, fertilizers, and sustainable food items in Butuan City.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10 sm:mb-12">
          <div class="rounded-2xl bg-white border border-violet-100 shadow-sm shadow-violet-500/5 p-6 sm:p-8 flex flex-col">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                <BuildingStorefrontIcon class="w-7 h-7" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">Vendors</h3>
            </div>
            <p class="text-gray-600 text-sm sm:text-base mb-5">
              Market sellers and producers use AniHan to report surplus or damaged crops, track processing, and list finished goods for sale.
            </p>
            <ul class="space-y-3 text-sm sm:text-base text-gray-600 flex-1">
              <li class="flex gap-2">
                <CheckIcon class="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                <span>Submit source waste and convert it into catalog products (compost, preserved goods, and more).</span>
              </li>
              <li class="flex gap-2">
                <CheckIcon class="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                <span>Manage inventory, orders, and deliveries from your vendor dashboard.</span>
              </li>
              <li class="flex gap-2">
                <CheckIcon class="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                <span>New vendor accounts are reviewed by an admin before you can operate—upload your business details at registration.</span>
              </li>
            </ul>
            <router-link
              v-if="!authStore.isAuthenticated"
              to="/register?role=vendor"
              class="mt-6 w-full sm:w-auto inline-flex justify-center items-center px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 shadow-md transition-colors"
            >
              Register as vendor
            </router-link>
          </div>

          <div class="rounded-2xl bg-white border border-emerald-100 shadow-sm shadow-emerald-500/5 p-6 sm:p-8 flex flex-col">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ShoppingBagIcon class="w-7 h-7" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">Users (buyers)</h3>
            </div>
            <p class="text-gray-600 text-sm sm:text-base mb-5">
              Residents and businesses browse the catalog, place orders, pay as configured, and track delivery—without handling waste intake.
            </p>
            <ul class="space-y-3 text-sm sm:text-base text-gray-600 flex-1">
              <li class="flex gap-2">
                <CheckIcon class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Explore products on this page or in the full catalog after you sign in.</span>
              </li>
              <li class="flex gap-2">
                <CheckIcon class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Checkout and follow order status, payment, and delivery updates in one place.</span>
              </li>
              <li class="flex gap-2">
                <CheckIcon class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Registration is quick—choose a user account to start shopping right away.</span>
              </li>
            </ul>
            <router-link
              v-if="!authStore.isAuthenticated"
              to="/register?role=user"
              class="mt-6 w-full sm:w-auto inline-flex justify-center items-center px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md transition-colors"
            >
              Register as user
            </router-link>
          </div>
        </div>

        <p v-if="!authStore.isAuthenticated" class="text-center text-sm text-gray-500">
          Already have an account?
          <router-link to="/login" class="font-semibold text-violet-700 hover:text-violet-900 underline underline-offset-2">Sign in</router-link>
        </p>
      </div>
    </section>

    <!-- Public product showcase (no login required; API: GET /products?public=1) -->
    <section id="products" class="py-12 sm:py-16 lg:py-20 bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10 sm:mb-12">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100 text-violet-600 mb-4">
            <ShoppingBagIcon class="w-7 h-7" />
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Available products</h2>
          <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Repurposed goods from local vendors—browse what’s in stock. Sign in to place an order.
          </p>
        </div>

        <div v-if="publicLoading" class="flex justify-center py-16">
          <div class="h-10 w-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" aria-hidden="true" />
        </div>

        <p v-else-if="publicError" class="text-center text-sm text-amber-700 bg-amber-50 rounded-xl py-4 px-4 max-w-lg mx-auto">
          {{ publicError }}
        </p>

        <div v-else-if="publicProducts.length === 0" class="text-center py-12 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
          <CubeIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-600 font-medium">No listings yet</p>
          <p class="text-sm text-gray-500 mt-1">Check back soon—or register as a vendor to supply the catalog.</p>
          <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <router-link to="/register?role=vendor" class="btn-cta-gradient-vendor text-sm px-5 py-2">
              Register as vendor
            </router-link>
            <router-link to="/register?role=user" class="btn-cta-gradient-user text-sm px-5 py-2">
              Register as user
            </router-link>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <article
            v-for="product in publicProducts"
            :key="product.id"
            class="card overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
          >
            <div class="relative h-44 bg-gray-100">
              <img
                v-if="product.image_url && !imageErrors[product.id]"
                :src="displayImageUrl(product.image_url)"
                :alt="product.name"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="imageErrors[product.id] = true"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <CubeIcon class="w-12 h-12 text-gray-300" />
              </div>
              <span class="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full bg-white/90 text-violet-700 shadow-sm">
                {{ categoryLabel(product.category) }}
              </span>
            </div>
            <div class="card-body p-4 flex flex-col flex-1">
              <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">{{ product.name }}</h3>
              <p class="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">{{ product.description }}</p>
              <p v-if="vendorLine(product)" class="text-xs text-emerald-700 font-medium mb-2">
                {{ vendorLine(product) }}
              </p>
              <div class="flex items-end justify-between pt-2 border-t border-gray-100 mt-auto">
                <span class="text-lg font-bold text-violet-600">₱{{ Number(product.price).toFixed(0) }}</span>
                <span class="text-xs text-gray-500">{{ product.stock_quantity }} {{ product.unit }}</span>
              </div>
              <router-link
                v-if="!authStore.isAuthenticated"
                to="/login"
                class="mt-3 w-full text-center text-sm font-semibold py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Sign in to buy
              </router-link>
              <router-link
                v-else-if="authStore.user?.role === 'user'"
                to="/user/products"
                class="mt-3 w-full text-center text-sm font-semibold py-2 rounded-lg bg-gradient-to-r from-violet-600 to-emerald-600 text-white hover:from-violet-700 hover:to-emerald-700 transition-colors"
              >
                Open catalog
              </router-link>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">System Features & Capabilities</h2>
          <p class="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto px-4">
            AniHan implements real-time inventory tracking, data visualization tools, and ensures system usability through intuitive interfaces designed for users with varying levels of digital literacy.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <!-- For Vendors -->
          <div class="card text-center">
            <div class="card-body p-4 sm:p-6">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CubeIcon class="w-6 h-6 sm:w-8 sm:h-8 text-violet-600" />
              </div>
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">For Vendors</h3>
              <ul class="text-left space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600">
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Image-based waste classification system</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Real-time inventory and tracking module</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Automated pickup scheduling</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Processing status monitoring</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Performance analytics and reports</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- For Consumers -->
          <div class="card text-center">
            <div class="card-body p-4 sm:p-6">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <ShoppingBagIcon class="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">For Consumers</h3>
              <ul class="text-left space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600">
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-diamond-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Browse comprehensive product catalog</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-diamond-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Purchase organic compost & fertilizers</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-diamond-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Order sustainable preserved food items</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-diamond-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Track order status and delivery</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-diamond-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access affordable organic inputs</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- For Environment -->
          <div class="card text-center">
            <div class="card-body p-4 sm:p-6">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-diamond-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <SparklesIcon class="w-6 h-6 sm:w-8 sm:h-8 text-diamond-600" />
              </div>
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">System Capabilities</h3>
              <ul class="text-left space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600">
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-blood-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Data visualization tools (charts & graphs)</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-blood-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>System Usability Scale (SUS) evaluation</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-blood-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Real-time processing logs</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-blood-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Educational resources integration</span>
                </li>
                <li class="flex items-start">
                  <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5 text-blood-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Mobile-responsive design</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-12 sm:py-16 lg:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Our Impact in Numbers</h2>
          <p class="text-base sm:text-lg lg:text-xl text-gray-600">Making a difference in Butuan City's agricultural waste management</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div class="text-center">
            <div class="text-2xl sm:text-3xl lg:text-4xl font-bold text-violet-600 mb-1 sm:mb-2">1,247</div>
            <div class="text-xs sm:text-sm lg:text-base text-gray-600">Active Users</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 mb-1 sm:mb-2">15,420</div>
            <div class="text-xs sm:text-sm lg:text-base text-gray-600">Kg Waste Processed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl lg:text-4xl font-bold text-blood-600 mb-1 sm:mb-2">892</div>
            <div class="text-xs sm:text-sm lg:text-base text-gray-600">Orders Completed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl lg:text-4xl font-bold text-diamond-600 mb-1 sm:mb-2">₱456K</div>
            <div class="text-xs sm:text-sm lg:text-base text-gray-600">Revenue Generated</div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">About AniHan</h2>
            <p class="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6">
              <strong>AniHan: A Digital Platform for Repurposing Agricultural Food Waste in Butuan City</strong> 
              is a capstone project developed by Christian Angelo Verdad and Wayne Krisha Cadenas, submitted 
              to the Department of Information Systems, College of Computing and Information Sciences (CCIS) 
              at Caraga State University - Main Campus.
            </p>
            <p class="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6">
              This comprehensive digital system addresses the critical issue of agricultural food waste in 
              Butuan City by creating a sustainable ecosystem that transforms surplus or damaged agricultural 
              produce into valuable products such as compost fertilizers and sustainable food items.
            </p>
            <p class="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6">
              The platform contributes to sustainability efforts and supports the United Nations' Zero Hunger 
              initiative by promoting efficient resource use and food security through real-time inventory 
              tracking, data visualization tools, and intuitive interfaces designed for users with varying 
              levels of digital literacy.
            </p>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 font-bold text-sm sm:text-base">CS</span>
                </div>
                <div class="ml-3">
                  <div class="font-medium text-gray-900 text-sm sm:text-base">Caraga State University</div>
                  <div class="text-xs sm:text-sm text-gray-500">Department of Information Systems, CCIS</div>
                  <div class="text-xs sm:text-sm text-gray-500">Developed by: Christian Angelo Verdad & Wayne Krisha Cadenas</div>
                </div>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="aspect-w-16 aspect-h-9">
              <div class="bg-gradient-to-r from-primary-500 to-green-600 rounded-lg h-64 sm:h-80 lg:h-96 flex items-center justify-center">
                <div class="text-center text-white">
                  <SunIcon class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p class="text-base sm:text-lg lg:text-xl font-medium">Sustainable Agriculture</p>
                  <p class="text-green-200 text-sm sm:text-base">For a Better Tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-violet-600 to-emerald-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Join the Agricultural Waste Revolution</h2>
        <p class="text-base sm:text-lg lg:text-xl text-emerald-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
          Be part of a sustainable solution that transforms agricultural waste into valuable resources, 
          supports food security, and contributes to the United Nations' Zero Hunger initiative in Butuan City.
        </p>
        <div v-if="!authStore.isAuthenticated" class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 flex-wrap">
          <router-link to="/register?role=vendor" class="btn-cta-gradient-vendor">
            Register as vendor
          </router-link>
          <router-link to="/register?role=user" class="btn-cta-gradient-user">
            Register as user
          </router-link>
          <router-link to="/login" class="btn-cta-gradient-signin">
            Sign In
          </router-link>
        </div>
        <div v-else class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 flex-wrap">
          <router-link :to="dashboardPath" class="btn-cta-gradient-dashboard">
            Open dashboard
          </router-link>
          <a href="#products" class="btn-cta-gradient-browse text-center">
            Browse products
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-gray-900 text-white py-8 sm:py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div class="flex items-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">
              <div class="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-violet-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm sm:text-lg">A</span>
              </div>
              <span class="text-lg sm:text-xl font-bold">AniHan</span>
            </div>
            <p class="text-gray-400 text-xs sm:text-sm">
              A Digital Platform for Repurposing Agricultural Food Waste in Butuan City - 
              Supporting sustainability and the UN Zero Hunger initiative.
            </p>
          </div>
          
          <div>
            <h3 class="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul class="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
              <li><a href="#products" class="hover:text-white">Products</a></li>
              <li><a href="#how-it-works" class="hover:text-white">How it works</a></li>
              <li><a href="#features" class="hover:text-white">Features</a></li>
              <li><a href="#about" class="hover:text-white">About</a></li>
              <li><router-link to="/login" class="hover:text-white">Sign In</router-link></li>
              <li><router-link to="/register?role=user" class="hover:text-white">Register</router-link></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h3>
            <ul class="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
              <li>Caraga State University - Main Campus</li>
              <li>Department of Information Systems, CCIS</li>
              <li>Butuan City, Agusan del Norte</li>
              <li>Philippines</li>
              <li>Developers: Christian Angelo Verdad & Wayne Krisha Cadenas</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Follow Us</h3>
            <div class="flex space-x-3 sm:space-x-4">
              <a href="#" class="text-gray-400 hover:text-white">
                <span class="sr-only">Facebook</span>
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <span class="sr-only">Twitter</span>
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; 2024 AniHan. All rights reserved. A capstone project by Christian Angelo Verdad & Wayne Krisha Cadenas, Caraga State University.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  CubeIcon,
  CheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  SunIcon,
  BuildingStorefrontIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import apiService from '@/services/api'
import { getImageUrl } from '@/utils/imageUtils'
import { resolveDemoImageUrl } from '@/constants/demoMedia'
import type { Product } from '@/types'

const authStore = useAuthStore()

const dashboardPath = computed(() => {
  if (authStore.isAdmin) return '/admin/dashboard'
  if (authStore.isVendor) return '/vendor/dashboard'
  return '/user/dashboard'
})

const publicProducts = ref<Product[]>([])
const publicLoading = ref(true)
const publicError = ref<string | null>(null)
const imageErrors = reactive<Record<string, boolean>>({})

function displayImageUrl(url: string) {
  return getImageUrl(resolveDemoImageUrl(url))
}

function categoryLabel(cat: string) {
  const m: Record<string, string> = {
    compost: 'Compost',
    fertilizer: 'Fertilizer',
    preserved_food: 'Preserved food',
    processed_food: 'Processed food',
    other: 'Other'
  }
  return m[cat] || cat
}

function vendorLine(p: Product) {
  const v = p.vendor
  if (!v) return ''
  return v.business_name?.trim() || v.full_name?.trim() || ''
}

onMounted(async () => {
  try {
    const res = (await apiService.getPublicProducts()) as { success?: boolean; data?: unknown }
    if (res.success && Array.isArray(res.data)) {
      publicProducts.value = res.data.map((row: Record<string, unknown>) => {
        const vendorRaw = row.vendor as Record<string, unknown> | undefined
        const vendor =
          vendorRaw && typeof vendorRaw === 'object'
            ? {
                id: String(vendorRaw.id ?? ''),
                full_name: String(vendorRaw.full_name ?? ''),
                business_name: String(vendorRaw.business_name ?? ''),
                email: String(vendorRaw.email ?? '')
              }
            : undefined
        return {
          id: String(row.id ?? ''),
          name: String(row.name ?? ''),
          description: String(row.description ?? ''),
          price: Number(row.price) || 0,
          category: row.category as Product['category'],
          image_url: row.image_url != null ? String(row.image_url) : '',
          stock_quantity: Number(row.stock_quantity) || 0,
          unit: row.unit as Product['unit'],
          is_available: true,
          is_public: true,
          created_at: String(row.created_at ?? ''),
          updated_at: String(row.updated_at ?? ''),
          vendor
        } as Product
      })
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Could not load products'
    publicError.value = msg
  } finally {
    publicLoading.value = false
  }
})
</script>
